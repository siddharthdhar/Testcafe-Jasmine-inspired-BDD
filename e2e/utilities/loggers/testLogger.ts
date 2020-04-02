// All Timestamps pushed to log should be in the format (including the pipe | symbol): "YYYY-MM-DDTHH:MM:SS.sssZ |"
import { t as testController, RequestLogger } from 'testcafe';
import * as browserLogs from './browserLogger';

export function consoleColor(colorName: 'red' | 'green' | 'yellow' | 'cyan' | 'default') {
    const color = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        default: '\x1b[0m'
    };
    return process.env.suppressConsoleColors === 'true' ? '' : color[colorName];
}

const testPhases = {
    inTestAfterHook: 'inTestAfterHook',
    inFixtureAfterEachHook: 'inFixtureAfterEachHook',
    inTestBeforeHook: 'inTestBeforeHook',
    inFixtureBeforeEachHook: 'inFixtureBeforeEachHook',
    inTest: 'inTest'
};

/**
 * Generate a timestamp in ISOString Format (YYYY-MM-DDTHH:MM:SS.sssZ) alongwith | seperator
 * // returns "2020-03-24T14:31:21.032Z |"
 */

function timestamp(): string {
    return `${new Date().toISOString()} |`;
}

/**
 * Format the logs by providing Tab Indents
 * @param indentBy number of tabs before a sentence should start
 * @example
 * // returns: "     the line starts after 2 tabs"
 * console.log(`${tabIndent(2)}the line starts after 2 tabs`)
 */
function tabIndent(indentBy: number) {
    let indentString: string = '';
    for (let i = 0; i < indentBy; i++) {
        indentString = indentString.concat('\t');
    }
    return indentString;
}

/**
 * Capture all the requests and responses of the apis configured in e2e/environments.ts file.
 * Add this request logger to Test or Fixture and this will capture all the requests and responses to and from APIs throughtout the lifecyle of the test
 * @param context as ContxAsync
 */
export function apiRequestLogger(): RequestLogger {
    const logger = RequestLogger({
        logRequestHeaders: true,
        logResponseHeaders: true,
        logResponseBody: true,
        stringifyResponseBody: true
    });
    return logger;
}

/**
 * Push the api responses (captured throughout the lifecycle of the test) that did not result in status code 200 0r 302 to Test Log
 * @param httpRequestLogger as the testcafe Request Logger
 */
function pushRequestLoggerToTestLog(httpRequestLogger: RequestLogger) {
    const formatIndent = 2;
    httpRequestLogger.requests
        .filter((element) => element.response)
        .filter((element) => ![200, 204, 302, 304, 301, 307].includes(element.response.statusCode))
        .forEach((element) => {
            const request = {
                method: element.request.method,
                timestamp: new Date(element.request.timestamp).toISOString(),
                url: element.request.url
            };
            const response = {
                timestamp: new Date(element.response.timestamp).toISOString(),
                statusCode: element.response.statusCode,
                body: element.response.body
            };
            const messageWithTimeStamp = `${request.timestamp} |${tabIndent(formatIndent)}${consoleColor(
                'yellow'
            )}[HTTP Request:] [WARNING:]${consoleColor('default')} "${request.method.toUpperCase()}" on "${request.url}", responded with
            ${tabIndent(formatIndent)}status: ${response.statusCode}
            ${response.body ? tabIndent(formatIndent) + 'response body: ' + response.body : ''}`;
            pushToTestLog(undefined, messageWithTimeStamp.trim());
        });
}

/**
 * Call testLogger in every Test Phase, to keep a track of test phases and release test logs in case of a failure in Before or After Hook
 * @param testDetails Test Controller Details as JSON String
 * @param httpRequestLogger Test Cafe HTTP Request Logger
 * @param fn
 * @example
 * testLogger(testControllerToJsonString(t), httpRequestLogger, () => {
 *      await testCode;
 * })
 */
export async function testLogger(tc: TestController, httpRequestLogger: RequestLogger, fn: () => Promise<any>): Promise<any> {
    const testDetails = testControllerToJsonString(tc);
    const testPhase: string = JSON.parse(testDetails).testRun.phase;
    const logMessage = (hookName: string): string => `${tabIndent(1)}************************** ${hookName} **************************`;
    const phaseMap = {
        inTestAfterHook: (): string => '::TEST::AFTER HOOK::',
        inFixtureAfterEachHook: (): string => '::TEST::FIXTURE AFTER EACH HOOK::',
        inTestBeforeHook: (): string => '::TEST::BEFORE HOOK::',
        inFixtureBeforeEachHook: (): string => '::TEST::FIXTURE BEFORE EACH HOOK::',
        inTest: (): string => '::TEST HOOK::'
    };
    await pushToTestLog(logMessage(phaseMap[testPhase]()));
    return fn()
        .then(async () => {
            if (testPhase === testPhases.inTestAfterHook || testPhase === testPhases.inFixtureAfterEachHook) {
                await flushTestLogToConsole(testDetails, httpRequestLogger);
            }
        })
        .catch(async (error) => {
            if (
                testPhase === testPhases.inTestAfterHook ||
                testPhase === testPhases.inFixtureAfterEachHook ||
                testPhase === testPhases.inTestBeforeHook ||
                testPhase === testPhases.inFixtureBeforeEachHook
            ) {
                await flushTestLogToConsole(testDetails, httpRequestLogger);
                throw error;
            } else {
                throw error;
            }
        });
}

function testControllerToJsonString(tc: TestController): string {
    return JSON.stringify(tc, getCircularReplacer());
}

/**
 * Log the Test Case Step Description. If any test action is associated with the step description,
 * pass the test action as a callback along with associated testAssertion statements
 *
 * The function will add `Test Step Number` as well as `Test Name` as prefix to the test case description
 *
 * `DO NOT ADD await before testActionCallback`
 * @param stepDescription as description of test step
 * @param fn as Test Cafe testcontroller action
 * @example
 * await testStep('Click the next button', async() => {
 *  await t.click('.next_button');
 * });
 * // returns [Step 1:] Click the next button
 * // or
 * // [Step 1:] [ERROR:] Click the next button
 */
export async function testStep(stepDescription: string, fn?: () => Promise<any>): Promise<any> {
    incrementTestStepNumber();
    const message = `${tabIndent(1)}[Step ${currentStepNumber()}:] ${stepDescription}`;
    const messageOnError = `${tabIndent(1)}${consoleColor('red')}[Step ${currentStepNumber()}:] [ERROR:] ${stepDescription}${consoleColor(
        'default'
    )}`;
    pushToTestLog(message);
    if (fn) {
        return fn().catch((error) => {
            pushToTestLog(messageOnError);
            throw error;
        });
    }
}

/**
 * log the description of assertion as Passed or Failed
 * @param passMessage description of assertion to be marked as PASSED or FAILED
 * @param fn Test Cafe testcontroller assertion as callback
 * @example
 * // Returns
 * //     [PASSED:]: Overview Page: should show Change Plan
 * // OR
 * //     [FAILED:]: Overview Page: should show Change Plan
 * await it('Overview Page: should show Change Plan', async() => {
 *       await t.expect(Selector('.changePlanSelector').innerText)
 *              .eqls('Change Plan', logFailureMessage('Expected text Change Plan was not found on Overview Page'));
 * });
 */
export async function it(passMessage: string, fn: () => Promise<any>): Promise<any> {
    const messageTestPassed = `${tabIndent(2)}${consoleColor('green')}[PASSED:] ${passMessage} ${consoleColor('default')}`;
    const messageTestFailed = `${tabIndent(2)}${consoleColor('red')}[FAILED:] ${passMessage} ${consoleColor('default')}`;
    return fn()
        .then(() => pushToTestLog(messageTestPassed))
        .catch(async (error) => {
            pushToTestLog(messageTestFailed);
            throw error;
        });
}

export function testInfo(message: string): Promise<void> {
    return pushToTestLog(`${tabIndent(2)}${consoleColor('cyan')}[INFO:] ${message}${consoleColor('default')}`);
}

/**
 * Should be used log assertion failure messages
 * @param failMsg
 * @example
 * testAssertion(
 *      'Overview Page: should show Change Plan',
 *       t.expect(Selector('.changePlanSelector').innerText)
 *        .eqls('Change Plan', logFailureMessage('Expected text Change Plan was not found on Overview Page')));
 */

export function logFailureMessage(failMsg: string): string {
    failMsg = !failMsg ? '' : `FAILED: ${failMsg}`;
    return failMsg;
}

/**
 * Adds Fixture Name and Test Description from the test cafe testcontroller to the TOP of test logger
 * @param testDetails Test Controller details from Test Cafe Test as a JSON string
 */
function logFixtureAndTestDescription(testDetails: string) {
    if (!testController.ctx.logs) {
        testController.ctx.logs = [];
    }
    const fixtureMessage = `${timestamp()}[FIXTURE:] ${JSON.parse(testDetails).testRun.test.testFile.currentFixture.name}`;
    const testDescriptionMessage = `${timestamp()}[Test:] ${JSON.parse(testDetails).testRun.test.name}`;
    testController.ctx.logs.splice(
        0,
        0,
        `\n\n\nLogs For Quarantine ATTEMPT: ${
            JSON.parse(testDetails).testRun.browserManipulationQueue.screenshotCapturer.pathPattern.placeholderToDataMap[
                '${QUARANTINE_ATTEMPT}'
            ]
        }`
    );
    testController.ctx.logs.splice(1, 0, `[TAGS]: ${JSON.stringify(JSON.parse(testDetails).testRun.test.testFile.currentFixture.meta)}`);
    testController.ctx.logs.splice(2, 0, `${fixtureMessage}`);
    testController.ctx.logs.splice(3, 0, testDescriptionMessage);
}

/**
 * Flush the test log to console.
 * This sorts the messages based on timestamp based on format: "YYYY-MM-DDTHH:MM:SS.sssZ |".
 * Collects all the API responses that did not resulted in a warning/error
 * The final sorted result is stripped off the timestamp and pushed to console.
 * @param testdetails JSON Object string
 * @param httpRequestLogger as Test Cafe Request Logger
 */
async function flushTestLogToConsole(testdetails: string, httpRequestLogger: RequestLogger): Promise<void> {
    // Step 1: Fetch all the browser logs collected for the lifetime of the test
    await browserLogs.pushBrowserLogToTestLog();

    // Step 2: Fetch all the API Responses that did not result in status code 200 or 302
    pushRequestLoggerToTestLog(httpRequestLogger);

    // Step 3: Sort the logs based on timestamp.
    // **DISCLAIMER** If timestamp wasn't passed as a part of log message, sorting will be incorrect
    testController.ctx.logs = testController.ctx.logs.sort();

    // Step 4: Add the Fixture and Test Description to the top of the Array, to identify the test more accurately and easily
    logFixtureAndTestDescription(testdetails);

    // Step 5: Finally print the array without the timestamps
    return Promise.resolve(
        testController.ctx.logs.forEach((element: string) => {
            console.log(element.includes('|') ? element.split('|')[1] : element);
        })
    );
}

/**
 * Push the message to test log
 * @param logMessage message with timestamp NOT included example: "Log Message"
 * @param logWithTimestamp message with timestamp included. example: "2020-02-01T13:40:05.789Z | Log Message"
 * @example
 * pushToTestLog('This is a Log Message Without Timestamp');
 * // OR
 * pushToTestLog(undefined, '2020-02-01T13:40:05.789Z | This is a Log Message WITH Timestamp')
 */
export function pushToTestLog(logMessage: string, logWithTimestamp?: string): Promise<void> {
    const message = logWithTimestamp ? logWithTimestamp : `${timestamp()}${logMessage}`;
    return !testController.ctx.logs ? (testController.ctx.logs = []).push(message) : testController.ctx.logs.push(message);
}

function incrementTestStepNumber(): Promise<number> {
    return (testController.ctx.stepNumber = !testController.ctx.stepNumber ? 1 : testController.ctx.stepNumber + 1);
}

function currentStepNumber(): Promise<number> {
    return testController.ctx.stepNumber;
}

/**
 * To read Circular Structures
 * @example
 * JSON.stringify(test, getCircularReplacer());
 * // simplifies "test" circular structure as a JSON String
 */
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
