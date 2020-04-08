main();

function main() {
    const fs = require('fs');
    const path = require('path');
    const logFile = process.env.testLogPath;
    const reportFile = path.join(process.env.reportBaseDir, 'testcafe.json');
    const htmlContent = require('./testcafeHtmlReporter');
    // const logFile = 'reports/testcafe/testcafeLog.json';
    // const reportFile = 'reports/testcafe/testcafe.json';

    fs.readFile(logFile, 'utf-8', (readErr, logFileData) => {
        if (readErr) {
            throw readErr;
        }
        let logData = JSON.parse(logFileData).logs;
        fs.readFile(reportFile, 'utf-8', (readErr, reportFileData) => {
            if (readErr) {
                throw readErr;
            }
            let reportData = JSON.parse(reportFileData);
            reportData.fixtures.forEach((fixture) => {
                fixture.tests.forEach((test) => {
                    logData.find((log) => {
                        if (log.testName === test.name) {
                            Object.assign(test, { quarantineAttempt: log.quarantineAttempt });
                            Object.assign(test, { testLog: log.testLog });
                        } else {
                            return false;
                        }
                    });
                });
            });
            fs.writeFile('reports/testcafe.json', JSON.stringify(reportData, null, 2), 'utf-8', (writeErr) => {
                if (writeErr) {
                    console.log('Report JSON and Test JSON - Merge UNSUCCESSFUL');
                    throw writeErr;
                } else {
                    console.log('Report JSON and Test JSON - Merged SUCCESSFULLY');
                }
            });
            fs.writeFile('reports/testcafe.html', htmlContent(reportData), 'utf-8', (writeErr) => {
                if (writeErr) {
                    console.log('Report JSON and Test JSON - HTML creation UNSUCCESSFUL');
                    throw writeErr;
                } else {
                    console.log('Report JSON and Test JSON - HTML creation SUCCESSFULL');
                }
            });
        });
    });
}
