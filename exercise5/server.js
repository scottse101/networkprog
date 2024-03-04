const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 8080;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/')));

app.post('/runcode', (req, res) => {
    const code = req.body.code;

    console.log(`Running code: ${code}`);

    const javaFilePath = path.join(__dirname, 'temp.java');
    const compiledFilePath = path.join(__dirname, 'temp.class');

    require('fs').writeFileSync(javaFilePath, code);

    exec(`javac ${javaFilePath}`, (compileError) => {
        if (compileError) {
            res.json({ output: `Compilation Error: ${compileError.message}` });
        } else {
            exec(`java -cp ${path.dirname(compiledFilePath)} temp`, (runError, stdout, stderr) => {
                if (runError) {
                    res.json({ output: `Runtime Error: ${runError.message}` });
                } else {
                    res.json({ output: stdout });
                }

                require('fs').unlinkSync(javaFilePath);
                require('fs').unlinkSync(compiledFilePath);
            });
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
