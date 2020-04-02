const { spawnSync } = require('child_process');
const color = require('./consoleColors');

module.exports = function execCommand(command, stdoutCallback) {
    const commands = command.split(' ');
    const options = {
        stdio: stdoutCallback ? 'pipe' : 'inherit', // inherit: continue to log messages to the console
        shell: true // required to spawn as expected on windows
    };

    var child = commands.length === 1 ? spawnSync(commands[0], options) : spawnSync(commands[0], commands.slice(1), options);
    const exitCode = child.status;
    console.log(exitCode === 0 ? color.default : color.yellow, `executed: '${command}' - exit code ${child.status}`, color.default);

    if (stdoutCallback) {
        stdoutCallback(child.output);
    }

    return exitCode;
};
