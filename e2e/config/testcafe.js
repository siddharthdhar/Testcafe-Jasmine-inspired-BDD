require('ts-node').register({
    project: 'tsconfig.json'
});

const commandLineArgs = require('command-line-args');
const execCommand = require('../../scripts/lib/executeCommand');
const path = require('path');
const log = require('../utilities/loggers/testLogger');
// const allEnvironments = require('../e2e/environments').Environments.all;
const processArgs = process.env.npm_config_argv;
const mobile = require('../enums/enums').DeviceType.Mobile;
const desktop = require('../enums/enums').DeviceType.Desktop;
const browserList = ['chrome', 'ie', 'internet explorer', 'edge', 'firefox', 'opera', 'safari', 'chromium', 'chrome-canary'];
const reportBaseDir = 'reports';
const smoke = processArgs.includes('smoke');
const e2e = processArgs.includes('e2e');
const testDir = 'e2e/tests'
const smokeTestDir = path.join(testDir, 'smoke');
const e2eTestDir = path.join(testDir, 'regression');
const clientScriptDirectory = path.join('e2e', 'clientScripts');
process.env.reportBaseDir = reportBaseDir;
process.env.testLogPath = path.join(process.env.reportBaseDir, 'testcafeLog.json');

// DEFAULT VALUES:
let qrCodeCommand = '';
let remote = '';
let exitCode = -1;
let browser = 'chrome';
let device = desktop;
let testMetaData = [];
let fixtureMetaData = [];
let nunitReportPath = path.join(reportBaseDir, 'testcafe.xml');
let jsonReportPath = path.join(reportBaseDir, 'testcafe.json');
let screenshotPath = path.join(reportBaseDir, 'testCafeScreenshots');

const options = commandLineArgs([
    { name: 'browser', alias: 'b', type: String },
    { name: 'env', alias: 'e', type: String },
    { name: 'spec', alias: 's', type: String },
    { name: 'suite', alias: 'S', type: String },
    { name: 'concurrency', alias: 'c', type: Number, defaultValue: 1 },
    { name: 'screenshot', type: Boolean, defaultValue: false },
    { name: 'suppressConsoleColors', type: Boolean, defaultValue: false },
    { name: 'quarantineMode', alias: 'q', type: Boolean, defaultValue: false },
    { name: 'qrCode', type: Boolean }
]);

exitCode = runTests();

function runTests() {
    process.env.suppressConsoleColors = options.suppressConsoleColors ? true : false;
    // resolveEnvironment();
    logAndExecute('Set Sauce Username and Key as environment variables', setSauceVariables());
    logAndExecute('Set Percy Token as environment variables', setPercyVariables());
    resolveBrowser();

    // 1. Run Testcafe Tests
    logInfo('Running Testcafe Tests:');
    const testRun = execCommand(
        `yarn testcafe -c ${
            options.concurrency
        } ${remote} "${browser}" ${testDirectory()} ${qrCodeCommand} ${takeScreenshotOnFail()} ${resolveFixtureMetaData()} ${resolveTestMetaData()} ${runInQuarantineMode()} ${loadClientScripts()} --skip-js-errors -r spec,nunit:${nunitReportPath},json:${jsonReportPath} `
    );
    console.log('\n');
    testRun === 0 ? logInfo(`Test Run Completed with exit code ${testRun}`) : logWarn(`Test Run Completed with exit code ${testRun}`);

    // 2. Create Custom Test Report
    console.log('\n');
    logInfo('Merge Testcafe Report JSON and Test JSON...');
    const createReport = execCommand('node scripts/testcafeMergeLogAndReport.js');
    createReport !== 0
        ? logError('Merge Testcafe Report JSON and Test JSON was Unsuccessful')
        : logInfo('Merge Testcafe Report JSON and Test JSON was Successful');


    // visual testing code
    // execCommand(
    //     `yarn percy exec -- testcafe ${remote} "${browser}" e2e/testcafe/smokes/ ${qrCodeCommand} --test-meta ${runTestsWithMetaData()} --skip-js-errors`
    // );
}

process.exit(exitCode);

function setSauceVariables() {
    process.env.SAUCE_ACCESS_KEY = 'SAUCE_KEY';
    process.env.SAUCE_USERNAME = 'SAUCE_USERNAME';
}

function setPercyVariables() {
    process.env.PERCY_TOKEN = 'PERCY_TOKEN';
    process.env.PERCY_BRANCH = 'PERCY_BRANCH';
}

function resolveBrowser() {
    if (options.browser) {
        browser = options.browser;
        const isEmulation = browser.includes('emulation') ? true : false;
        const isDesktop = browserList.find((browserName) => browser.toLowerCase().includes(browserName.toLowerCase()));
        if (!isDesktop || isEmulation) {
            device = mobile;
        }
        logInfo(`Setting Browser to: "${browser}"`);
        logInfo(`Setting Device Type to: ${device}`);
    } else if (runOnOnRealMobile()) {
        qrCodeCommand = '--qr-code';
        remote = 'remote';
    } else {
        logWarn(`No Browser Supplied. If you wanted to set browser, please make sure you passed -b "BrowserName" in the arguments`);
        logWarn(`Setting default browser to: ${browser} and default device to: ${device}`);
    }
    process.env.device = device;
    process.env.browser = `"${browser}"`;
}

// function resolveEnvironment() {
//     var environmentName = options.env;
//     if (!environmentName) {
//         logError(`No environment passed. Please pass environment as yarn smoke:tc Environment_Name`);
//         process.exit(1);
//     } else {
//         const selectedEnv = allEnvironments.find((env) => env.name === environmentName);
//         if (!selectedEnv) {
//             logError(`"${environmentName}" is incorrect. Environments should be one of the below:`);
//             allEnvironments.forEach((env) => console.log(log.red, env.name));
//             process.exit(1);
//         }
//     }
//     process.env.environmentName = environmentName;
// }

function runOnOnRealMobile() {
    if (options.qrCode) {
        device = mobile;
        browser = '';
        process.env.device = device;
        process.env.browser = browser;
        logInfo('The tests are expected to run on your Physical Device. Please scan the QR Code on your mobile');
        logInfo(`Setting Device Type to: ${device}`);
        logInfo(`Setting Browser to: default browser on your phone`);
        return true;
    } else {
        return false;
    }
}

function testDirectory() {
    if (smoke) {
        return smokeTestDir;
    } else if (e2e) {
        return e2eTestDir;
    }
}

function resolveFixtureMetaData() {
    if (smoke) {
        logInfo('Running Tests Of Type: smoke');
        fixtureMetaData.push(`type=smoke`);
    }

    if (e2e) {
        logInfo('Running Tests Of Type: e2e');
        fixtureMetaData.push(`type=e2e`);
    }

    if (options.suite) {
        logInfo(`Running Tests Tagged: ${options.suite}`);
        fixtureMetaData.push(`suite=${options.suite}`);
    }

    return fixtureMetaData.length > 0 ? `--fixture-meta ${fixtureMetaData}` : '';
}

function resolveTestMetaData() {
    if (process.env.device === mobile) {
        testMetaData.push(`device=${mobile}`);
    }

    if (options.spec) {
        logInfo(`Running Tests Tagged: ${options.spec}`);
        testMetaData.push(`spec=${options.spec}`);
    }

    return testMetaData.length > 0 ? `--test-meta ${testMetaData}` : '';
}

function loadClientScripts() {
    const scripts = [path.join(clientScriptDirectory, 'patchBrowserLogs.js'), path.join(clientScriptDirectory, 'catchJsErrors.js')];
    return `--cs ${scripts}`;
}

function takeScreenshotOnFail() {
    windowsCommand = `-s path=${screenshotPath},takeOnFails=true,fullPage=true,pathPattern=\${TEST_INDEX}/\${USERAGENT}/\${QUARANTINE_ATTEMPT}/\${FILE_INDEX}.png`;
    nonWindowsCommand = `-s path=${screenshotPath},takeOnFails=true,fullPage=true,pathPattern=\\$\\{TEST_INDEX}/\\$\\{USERAGENT}/\\$\\{QUARANTINE_ATTEMPT}/\\$\\{FILE_INDEX}.png`;
    return options.screenshot ? (process.platform === 'win32' ? windowsCommand : nonWindowsCommand) : '';
}

function runInQuarantineMode() {
    return options.quarantineMode ? '-q' : '';
}

function logAndExecute(message, functionCallback) {
    logInfo(`${message} ...`);
    functionCallback;
}

function logInfo(message) {
    console.info(log.consoleColor('green'), '[INFO:]', message, log.consoleColor('default'));
}
function logWarn(message) {
    console.warn(log.consoleColor('yellow'), '[WARN:]', message, log.consoleColor('default'));
}
function logError(message) {
    console.error(log.consoleColor('red'), '[Error:]', message, log.consoleColor('default'));
}
