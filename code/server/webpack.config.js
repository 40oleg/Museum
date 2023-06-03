const path = require('path');

module.exports = {
    mode: "development",
    entry: "./src/main.ts",
    target: "node",
    output: {
        path: path.resolve(__dirname, "build"),
        chunkFormat: "module",
        filename: 'main.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
