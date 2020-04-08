import { t as testController } from 'testcafe';
import * as testLog from './testLogger';

const browserLogWhitelist = {
    containsMatchingWarning: (logMessage) => {
        const warnings: string[] = [
            // Only add messages to the whitelist that can safely be ignored. For example errors due to erroneous mock server responses should be fixed in mock server
            'You have a local storage override of the feature flag key',
        ];

        return warnings.some((logToIgnore: string) => logMessage.indexOf(logToIgnore) !== -1);
    },
    containsMatchingError: (logMessage) => {
        const errors: string[] = [
            // Only add messages to the whitelist that can safely be ignored. For example errors due to erroneous mock server responses should be fixed in mock server
        ];

        return errors.some((logToIgnore: string) => logMessage.indexOf(logToIgnore) !== -1);
    },
};

/**
 * Push all the captured browser logs to test log
 *
 * The browser logs depend on testcafe client script present at `"e2e/testcafe/clientScripts/patchBrowserLog.js"`
 *
 * patchBrowserLog.js patches browser console output with a custom message in the following format:
 *
 * "YYYY:MM:DDTHH:MM:SS:sssZ |\t\t[BROWSER LOG]::[warn] AT: [page-init] View delivery error Error: Request timed out[]"
 */
export async function pushBrowserLogToTestLog(): Promise<void> {
    // Uncomment the below for debugging purposes. Else do not push Info and Log level logs to test logger
    // (await testController.getBrowserConsoleMessages()).info.forEach((element) => testLog.pushToTestLog(undefined, element));
    // (await testController.getBrowserConsoleMessages()).log.forEach((element) => testLog.pushToTestLog(undefined, element));
    (await testController.getBrowserConsoleMessages()).warn
        .filter((warnLog) => !browserLogWhitelist.containsMatchingWarning(warnLog))
        .forEach(async (filteredWarnLog) => await testLog.pushToTestLog(undefined, filteredWarnLog));

    (await testController.getBrowserConsoleMessages()).error
        .filter((errorLog) => !browserLogWhitelist.containsMatchingError(errorLog))
        .forEach(async (filteredErrorLog) => await testLog.pushToTestLog(undefined, filteredErrorLog));
}
