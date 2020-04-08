module.exports = function htmlContent(reportObject) {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>My Account Test Report</title>
            <style>${cssStyle}</style>
        </head>
        <body>
            <table class="reportSummary">
                <thead>
                    <tr>
                        <th>User Agent</th>
                        <th>Total</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Skipped</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${reportObject.userAgents}</td>
                        <td>${reportObject.total}</td>
                        <td>${reportObject.passed}</td>
                        <td>${reportObject.total - reportObject.passed - reportObject.skipped}</td>
                        <td>${reportObject.skipped}</td>
                    </tr>
                </tbody>
            </table>
            <table>
                <tbody class="legendTable">
                    <tr>
                        <td>Fixtures: ${symbols.fixtures}</td>
                        <td>Tests: ${symbols.tests}</td>
                        <td>Browser Logs: ${symbols.browserLogs}</td>
                        <td>Http Requests: ${symbols.httpRequests}</td>
                        <td>Test Info: ${symbols.testInfo}</td>
                    </tr>
                </tbody>
            </table>
            ${flushFixtures(reportObject.fixtures)}
        </body>
    </html>
    `;
};

const cssStyle = `
table {
	width: 750px;
	border-collapse: collapse;
	margin:50px auto;
	}

th {
	background: #3498db;
	color: white;
	font-weight: bold;
	}

td, th {
	padding: 10px;
	border: 1px solid #ccc;
	text-align: left;
	font-size: 18px;
    }

tbody.legendTable td {
    border: 0;
}

.reportSummary tr td, th {
    padding: 10px;
	border: 1px solid #ccc;
	text-align: center;
	font-size: 18px;
}

.fixtures tr td {
    text-align: center;
    border: 5px solid black;
	font-weight: bold;
	color: #fff;
}

.fixtures tr td label {
	display: block;
}

.logItem {
   text-indent: 100px;
}

.httpRequest {
    color: #8c8e02;
    text-indent: 40px;
}

.browserLog {
    color: #9c899cf2;
    text-indent: 40px;
}

.browserLog span.error {
    color: red
}

.browserLog span.warn {
    color: orange
}

.testInfo {
    color: #6473e0;
    text-indent: 40px;
}

.logStep {
    font-weight: bold;
}

.logHead {
    text-align: center;
    color: #1d0ff3;
    font-weight: bold
}

[data-toggle="toggle"] {
	display: none;
}`;

const status = {
    passed: 'Passed',
    skipped: 'Skipped',
    failed: 'Failed'
};

const statusColors = {
    passed: '#2cc16a',
    skipped: '#e6a602',
    failed: '#e65202'
};

const symbols = {
    fixtures: '&#128301;',
    tests: '&#127776;',
    browserLogs: '&#128187;',
    httpRequests: '&#128376;',
    testInfo: '&#128712;',
    greenTick: '&#9989;',
    redCross: '&#10060;',
    slashChar: '&#92;'
};

function flushFixtures(fixtures) {
    const rows = [];
    fixtures.forEach((fixture, index) => {
        let fixtureBgColor = statusColors.passed;
        fixture.tests.find((test) => {
            if (test.skipped) {
                fixtureBgColor = statusColors.skipped;
                return true;
            } else if (test.errs.length > 0) {
                fixtureBgColor = statusColors.failed;
                return true;
            }
        });
        const elementIdentifier = `fixture${index + 1}`;
        const tableData = `
        <table>
            <tbody class="fixtures">
                <tr>
                    <td style="background-color:${fixtureBgColor};color:white;" colspan="10">
                        <label for="${elementIdentifier}">${symbols.fixtures} FIXTURE: ${fixture.name}</label>
                        <input type="checkbox" name="${elementIdentifier}" id="${elementIdentifier}" data-toggle="toggle">
                    </td>
                </tr>
            </tbody>
            <tbody>
            <td colspan="5" style="text-align: center;font-weight: bold;color: #100f0f;">
                &#128736; TEST RESULT FOR &#128736;
            </td>
            ${flushTests(fixture.tests)}
            </tbody>
        </table>
        `;
        return rows.push(tableData);
    });
    return rows.join('');
}

function flushTests(tests) {
    const rows = [];
    tests.forEach((test) => {
        let testStatus;
        let testBgColor = statusColors.passed;
        if (test.skipped) {
            testStatus = status.skipped;
            testBgColor = statusColors.skipped;
        } else if (test.errs.length > 0) {
            testStatus = status.failed;
            testBgColor = statusColors.failed;
        } else {
            testStatus = status.passed;
        }
        const tableData = `
        <tbody class="tests">
        <tr>
            <td colspan="3" style="background-color:${testBgColor}; color:white">${symbols.tests} ${test.name}</td>
            <td>${testStatus}</td>
        </tr>
            ${mapErrorsToLog(test.testLog, test)}
        </tbody>
        `;
        return rows.push(tableData);
    });
    return rows.join('');
}

function mapErrorsToLog(log, test) {
    const beforeTestIndex = log.findIndex((element) => {
        return element.includes('::TEST::BEFORE HOOK::') || element.includes('::TEST::FIXTURE BEFORE EACH HOOK::');
    });
    const testIndex = log.findIndex((element) => element.includes('::TEST HOOK::'));
    const afterTestIndex = log.findIndex((element) => {
        return element.includes('::TEST::AFTER HOOK::') || element.includes('::TEST::FIXTURE AFTER EACH HOOK::');
    });
    const beforeHookErrorText = 'Error in test.before hook';
    const afterHookErrorText = 'Error in test.after hook';
    const beforeHookErrs = [];
    const afterHookErrs = [];
    const testHookErrs = [];
    const rows = [];
    test.errs.forEach((err, index) => {
        if (err.includes(beforeHookErrorText)) {
            beforeHookErrs.push(err);
        } else if (err.includes(afterHookErrorText)) {
            afterHookErrs.push(err);
        } else {
            testHookErrs.push(err);
        }
    });

    rows.push(`<tr><td class = "logHead" colspan="5">TEST HOOK: BEFORE TEST</td></tr>`);
    beforeTestIndex !== -1
        ? log.slice(beforeTestIndex + 1, testIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push('<tr><td colspan="5">NO LOG FOUND</td></tr>');
    if (beforeHookErrs.length > 0) {
        beforeHookErrs.forEach((err) => rows.push(formatError(err)));
    }

    rows.push(`<tr><td class = "logHead" colspan="5">TEST BODY</td></tr>`);
    testIndex !== -1
        ? log.slice(testIndex + 1, afterTestIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push('<tr><td colspan="5">NO LOG FOUND</td></tr>');
    if (testHookErrs.length > 0) {
        testHookErrs.forEach((err) => rows.push(formatError(err)));
    }

    rows.push(`<tr><td class = "logHead" colspan="5">TEST HOOK: AFTER TEST</td></tr>`);
    afterTestIndex !== -1
        ? log.slice(afterTestIndex + 1, log.length - 1).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push('<tr><td colspan="5">NO LOG FOUND</td></tr>');
    if (afterHookErrs.length > 0) {
        afterHookErrs.forEach((err) => rows.push(formatError(err)));
    }

    return rows.join('');
}

function formatTestLog(logLine) {
    let additionalStyle = '';
    let className = 'logItem';
    if (logLine.includes('[INFO:]')) {
        className = 'testInfo';
        logLine = `${symbols.testInfo} ${logLine}`;
    } else if (logLine.includes('[BROWSER LOG]')) {
        className = 'browserLog';
        if (logLine.includes('[ERROR]')) {
            logLine = logLine.replace('[ERROR]', '<span class="error">[ERROR]</span>');
        } else if (logLine.includes('[warn]')) {
            logLine = logLine.replace('[warn]', '<span class="warn">[warn]</span>');
        }
        logLine = `${symbols.browserLogs} ${logLine}`;
    } else if (logLine.includes('[HTTP Request:]')) {
        className = 'httpRequest';
        logLine = `${symbols.httpRequests} ${logLine}`;
    } else if (logLine.includes('[PASSED:]')) {
        // Replace [PASSED:] with a Green Tick Symbol
        logLine = logLine.replace('[PASSED:]', `${symbols.greenTick}`);
    } else if (logLine.includes('[FAILED:]')) {
        // Replace [FAILED:] with a Red Cross Symbol
        logLine = logLine.replace('[FAILED:]', `${symbols.redCross}`);
        additionalStyle = 'style="color: red"';
    } else if (logLine.includes('[ERROR:]')) {
        // Replace [ERROR:] with a Red Cross Symbol
        logLine = logLine.replace('[ERROR:]', `${symbols.redCross}`);
        additionalStyle = 'style="color: red"';
    }
    return !logLine.includes('[Step')
        ? `<tr><td colspan="5" class = "${className}" ${additionalStyle}>${logLine}</td></tr>`
        : `<tr><td colspan="5" class = "logStep" ${additionalStyle}>${logLine}</td></tr>`;
}

function formatError(error) {
    let screenshotPath;
    error = JSON.stringify(error);
    // replace Javascript '\n' new line character with <br> in html
    // replace '\\' Javascript backward slash with &#92; in HTML
    error = error.replace(/\\n/g, '<br>').replace(/\\\\/g, symbols.slashChar);

    // Capture Screenshot path and split the relative path to be added to image property in html
    if (error.includes('Screenshot:')) {
        screenshotPath = error.split('Screenshot:')[1].split('<br>')[0];
        screenshotPath = screenshotPath.includes(symbols.slashChar)
            ? screenshotPath.split(`testcafe${symbols.slashChar}`)[1]
            : screenshotPath.split(`testcafe/`)[1];
    }

    const screeshotHtml = screenshotPath
        ? `
        <td style="white-space: pre;" colspan="5">
            <a href="${screenshotPath}">
                <img border="0" alt="ERROR" src="${screenshotPath}" width="300" height="300">
            </a>
        </td>
        `
        : `<td>NO SCREENSHOT FOUND</td>`;
    return `
        <tr>
            <td style="white-space: pre;" colspan="3">
                ${error}
            </td>
            ${screeshotHtml}
        </tr>
    `;
}
