const path = require("path");

const langConfig = {
    c: {
        extension: ".c",
        compileCommand: (filePath, outPath) => `gcc "${filePath}" -o "${outPath}"`,
        runCommand: (outPath) => `"${outPath}"`
    },
    python: {
        extension: ".py",
        runCommand: (filePath) => `python "${filePath}"`
    },
    java: {
        extension: ".java",
        compileCommand: (filePath) => `javac "${filePath}"`,
        runCommand: (dirPath) => `java -cp "${dirPath}" Main`
    }
};

module.exports = langConfig;