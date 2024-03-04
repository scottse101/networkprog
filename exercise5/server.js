const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 8080;

app.use(express.json());

app.post('/runcode', (req, res) => {
    const { code } = req.body;

    // Write code to a temporary Java file
    const fileName = 'temp.java';
    require('fs').writeFileSync(fileName, code);

    // Run the Java code using Docker
    exec(`docker run --rm -v "$(pwd)":/usr/src/app -w /usr/src/app openjdk:latest javac ${fileName} && java ${fileName.replace('.java', '')}`, (error, stdout, stderr) => {
        if (error) {
            res.send(stderr);
        } else {
            res.send(stdout);
        }
    });
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
