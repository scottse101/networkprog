#include <iostream>
#include <list>
#include <vector>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <thread>

using namespace std;

list<function<void()>> tasks;
mutex m;
condition_variable cv;
mutex cout_mutex;

class Workers {
public:
    Workers(int arg) {
        num_threads = arg;
        stop_flag = false;
    }

    ~Workers() {
        stop();
    }

    void start() {
        // Start the worker threads
        for (int i = 0; i < num_threads; ++i) {
            worker_threads.emplace_back([this] {
                workerThread();
            });
        }
    }

    void stop() {
        {
            unique_lock<mutex> lock(m);
            stop_flag = true;
        }
        cv.notify_all(); // Notify all threads to wake up and check the stop flag
        for (auto &thread : worker_threads) {
            if (thread.joinable()) {
                thread.join();
            }
        }
    }

    void post(const function<void()> &task) {
        unique_lock<mutex> lock(m);
        tasks.emplace_back(task);
        cv.notify_one(); // Notify one thread to wake up and process the task
    }

    void post_timeout(const function<void()> &task, int milliseconds) {
        auto execute_time = chrono::steady_clock::now() + chrono::milliseconds(milliseconds);

        unique_lock<mutex> lock(m);
        timed_tasks.emplace_back(execute_time, task);
        cv.notify_one();
    }

private:
    int num_threads;
    vector<pair<chrono::steady_clock::time_point, function<void()>>> timed_tasks;
    vector<thread> worker_threads;
    bool stop_flag;

    void workerThread() {
        while (true) {
            function<void()> task;
            chrono::steady_clock::time_point execute_time;

            {
                unique_lock<mutex> lock(m);

                cv.wait(lock, [this] {
                    return stop_flag || !tasks.empty() || !timed_tasks.empty();
                });

                if (stop_flag && tasks.empty() && timed_tasks.empty()) {
                    break;
                }

                if (!tasks.empty()) {
                    task = move(tasks.front());
                    tasks.pop_front();
                }

                if (!timed_tasks.empty()) {
                    auto earliest_task = min_element(timed_tasks.begin(), timed_tasks.end(),
                        [](const auto& lhs, const auto& rhs) {
                            return lhs.first < rhs.first;
                        });

                    execute_time = earliest_task->first;

                    if (execute_time <= chrono::steady_clock::now()) {
                        task = earliest_task->second;
                        timed_tasks.erase(earliest_task);
                    }
                }
            }

            if (task) {
                task();
            }
        }
    }
};



int main() {
    Workers worker_threads(4);
    Workers event_loop(1); 

    worker_threads.start();
    event_loop.start(); 

    worker_threads.post([]() {
        // do some work A
        lock_guard<mutex> lock(cout_mutex);
        std::cout << "Task A runs in thread " << std::this_thread::get_id() << std::endl;  
    });

    worker_threads.post_timeout([]() {
        // B, this is the post_timeout thread
        lock_guard<mutex> lock(cout_mutex);
        std::cout << "Task B runs in thread " << std::this_thread::get_id() << std::endl;
    }, 5000);

    event_loop.post([]() {
        // do some work C
        // might run parallel with A and B
        lock_guard<mutex> lock(cout_mutex);
        std::cout << "Task C runs in thread " << std::this_thread::get_id() << std::endl;
    });

    event_loop.post([]() {
        // do some work D
        // will run after C
        // might run in parallel with A and B
        lock_guard<mutex> lock(cout_mutex);
        std::cout << "Task D runs in thread " << std::this_thread::get_id() << std::endl;
    });

    worker_threads.stop(); // calls stop() on worker threads
    event_loop.stop();     // calls stop() on event loop thread

    return 0;
}
