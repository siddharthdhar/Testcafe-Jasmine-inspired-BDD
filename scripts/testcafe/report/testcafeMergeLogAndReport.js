main();

function main() {
    const fs = require('fs');
    const path = require('path');
    const logFile = process.env.testLogPath;
    const reportFile = path.join(process.env.reportBaseDir, 'testcafe.json');
    const testFolder = process.env.testLogDirectory;
    const testcafeCssSourceLocation = `${process.cwd()}/scripts/testcafe/report/testcafeReport.css`;
    const testcafeCssDestinationLocation = `${process.cwd()}/reports/testcafeReport.css`;
    var logs = { logs: [] };
    let step = 0;

    //Copying CSS for Testcafe Report
    try {
        fs.copyFileSync(testcafeCssSourceLocation, testcafeCssDestinationLocation)
    } catch (err) {
        console.log(`CSS copy errored out due to: \n${err}`);
        throw err;
    }
    // fs.copyFileSync(testcafeCssSourceLocation, testcafeCssDestinationLocation, (err) => {
    //     if (err) {
    //         console.log(`CSS copy errored out due to: \n${err}`);
    //         throw err;
    //     }
    // });

    fs.readFile(reportFile, 'utf-8', (readErr, reportFileData) => {
        if (readErr) {
            throw readErr;
        }
        let reportData = JSON.parse(reportFileData);

        new Promise((resolve, reject) => {
            console.log(`Step ${++step}: Read ${testFolder} Directory and get list of files`);
            fs.readdirSync(testFolder).forEach((file) => {
                try {
                    const data = fs.readFileSync(path.join(testFolder, file), 'utf8');
                    const content = JSON.parse(data);
                    logs.logs.push(...content.logs);
                } catch (err) {
                    return reject(err);
                }
            });
            return resolve();
        })
            .then(console.log(`Step ${step}: Completed`))
            .catch((err) => console.log(`Step ${step}: Error while reading file / missing file ${path.join(testFolder, file)}: \n${err}`));

        new Promise((resolve, reject) => {
            console.log(`Step ${++step}: Write into  ${logFile} all the logs`);
            fs.writeFileSync(logFile, JSON.stringify(logs), 'utf-8', (writeErr) => {
                if (writeErr) {
                    return reject(writeErr);
                }
            });
            return resolve();
        })
            .then(() => console.log(`Step ${step}: Completed`))
            .catch((writeErr) => console.log(`Step ${step}: Errored out due to: \n${writeErr}`));

        // In TestCafe JSON Report TOTAL = PASSED + FAILED (SKIPPED is not counted as a part of total)
        // If No Tests were executed, the testcafeLog.json (Custom Logger File) would not have been created.
        // For the above scenario, skip TestCafeLog.json to TestCafe.json mapping and create only the HTML Report

        if (reportData.total !== 0) {
            fs.readFile(logFile, 'utf-8', (readErr, logFileData) => {
                if (readErr) {
                    throw readErr;
                }
                let logData = JSON.parse(logFileData).logs;
                reportData.fixtures.forEach((fixture) => {
                    fixture.tests.forEach((test) => {
                        logData.forEach((log) => {
                            if (log.testName === test.name) {
                                Object.assign(test, { quarantineAttempt: log.quarantineAttempt, testLog: log.testLog });
                            }
                        });
                    });
                });

                // HTML Report generation is dependant on Testcafe JSON Report and Log Merge. Sometimes the merge is still in progress while the code moves on to creating an HTML Report
                // The following promise ensures that JSON Report and Log Merge completed before moving to HTML Report creation.
                new Promise(function(resolve, reject) {
                    console.log(`Step ${++step}: Report JSON and Test JSON - Merge Initiated`);
                    fs.writeFile(reportFile, JSON.stringify(reportData, null, 2), 'utf-8', (writeErr) => {
                        if (writeErr) {
                            //console.log('Report JSON and Test JSON - Merge UNSUCCESSFUL');
                            reject(writeErr);
                        } else {
                            console.log(`Step ${step}: Completed`);
                            resolve();
                        }
                    });
                })
                    .then(() => writeToHtmlFile(reportData, step))
                    .catch((err) => console.log(`Step ${step}: Errored out due to: \n${err}`));
            });
        } else {
            writeToHtmlFile(reportData, step);
        }
    });
}

function writeToHtmlFile(reportData, step) {
    const fs = require('fs');
    const htmlContent = require('./testcafeHtmlReporter');
    console.log(`Step ${++step}: HTML Report Creation Initiated`);
    fs.writeFile('reports/testcafe.html', htmlContent(reportData), 'utf-8', (writeErr) => {
        if (writeErr) {
            console.log(`Step ${step}: Errored out due to: \n${err}`);
            throw writeErr;
        } else {
            console.log(`Step ${step}: HTML Report Creation successfully Completed`);
        }
    });
}
