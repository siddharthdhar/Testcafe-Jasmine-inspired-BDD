module.exports = function resolveOptions() {
    if (options._unknown || options.help) {
        if (options._unknown) {
            console.log(options._unknown, 'is not a valid option. Please refer to the guide below');
        }
        console.log(commandLineUsage(sections));
        return process.exit(1);
    } else {
        return options;
    }
};

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions = [
    // {
    //     name: 'env',
    //     alias: 'e',
    //     type: String,
    //     defaultOption: true,
    //     description:
    //         'provide an environment name, such as local, production, etc. User can also pass the environment name without passing -e or --env argument.'
    // },
    {
        name: 'browser',
        alias: 'b',
        type: String,
        description:
            'provide the browser name to run the test on. If no argument is passed, tests are run on Chrome by default. Example: -b firefox'
    },
    {
        name: 'spec',
        alias: 's',
        type: String,
        description: 'provide the test name, if configured as meta data in your TEST. Example: -s spec_name or --spec spec_name'
    },
    {
        name: 'suite',
        alias: 'S',
        type: String,
        description: 'provide the suite name configured as meta data in your FIXTURE. Example: -S suite_name or --suite suite_name'
    },
    {
        name: 'concurrency',
        alias: 'c',
        type: Number,
        defaultValue: 1,
        description:
            'to run tests in parallel, provide a number greater than 1. The provided number of browsers will be initiated in parallel. Example: -c 5'
    },
    {
        name: 'screenshot',
        type: Boolean,
        defaultValue: false,
        description: 'pass --screenshot, if you want to take screenshots on test failure. No screenshots are taken by default'
    },
    {
        name: 'suppressConsoleColors',
        type: Boolean,
        defaultValue: false,
        description: 'to suppress console colors of logs, pass --supressConsoleColors. Logs are output with colors by default'
    },
    {
        name: 'quarantineMode',
        alias: 'q',
        type: Boolean,
        defaultValue: false,
        description:
            'to run tests in Quarantine Mode, pass -q or --quarantineMode. To learn more about quarantine mode, refer Test Cafe Quarantine Mode in testcafe documentation'
    },
    { name: 'qrCode', type: Boolean, description: 'experimental feature to run tests on a Real Mobile device' },
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        defaultOption: false,
        description: 'Help'
    }
];

const sections = [
    {
        header: 'Test Cafe Tests for My Account',
        content: 'usage: yarn smoke:tc environment_name [options]'
    },
    {
        header: 'Options',
        optionList: optionDefinitions
    }
];

const options = commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true });
