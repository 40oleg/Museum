const { spawn } = require('node:child_process');

const subprocess = spawn(process.argv[0], ['main.js'], {
    detached: true,
    stdio: 'ignore',
});

subprocess.unref();
