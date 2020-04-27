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
                        <th><button class="filterBtn" id="total">Total</button></th>
                        <th><button class="filterBtn" id="passed">Passed</button></th>
                        <th><button class="filterBtn" id="failed">Failed</button></th>
                        <th><button class="filterBtn" id="skipped">Skipped</button></th>
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
            <table class="legendTable">
                    <tr>
                        <td>Fixtures: ${symbols.fixtures}</td>
                        <td>Tests: ${symbols.tests}</td>
                        <td>Browser Logs: ${symbols.browserLogs}</td>
                        <td>Http Requests: ${symbols.httpRequests}</td>
                        <td>Test Info: ${symbols.testInfo}</td>
                    </tr>
            </table>

            ${expandAndCollapseButtons}

            ${flushFixtures(reportObject.fixtures)}

            ${expandAndCollapseButtons}

            <script type="text/javascript">

            var acc = document.getElementsByClassName("accordian");
            var failed = document.getElementsByName("fixture-Failed");
            var expandAll = document.getElementsByName("expand");
            var collapseAll = document.getElementsByName("collapse");
            var failedFixtures = document.getElementsByName("expand-fixtures-Failed");
            var filterFail = document.getElementById("failed")
            var filterPassed = document.getElementById("passed")
            var filterSkipped = document.getElementById("skipped")
            var filterTotal = document.getElementById("total");

            // Click on Individual accordian to expand and collapse
            for (var i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function () {
                    this.classList.toggle("active");
                    var panel = this.nextElementSibling;
                    var testRow = this.nextElementSibling.nextElementSibling;
                    if (panel.style.display === "block") {
                        panel.style.display = "none";
                        testRow.style.display = "none";
                    } else {
                        panel.style.display = "block";
                        testRow.style.display = "block";
                    }
                });
            }

            // Click on Expand All Buttons to expand all the accordians
            for (var i = 0; i < expandAll.length; i++) {
                expandAll[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        acc[j].nextElementSibling.style.display = "block";
                        acc[j].nextElementSibling.nextElementSibling.style.display = "block";
                    }
                });
            }

            // Click on Collapse All Buttons to collapse all the accordians
            for (var i = 0; i < collapseAll.length; i++) {
                collapseAll[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        acc[j].nextElementSibling.style.display = "none";
                        acc[j].nextElementSibling.nextElementSibling.style.display = "none";
                    }
                });
            }

            // Click on Expand Failed Fixturesbutton to expand only the failed fixtures
            for (var i = 0; i < failedFixtures.length; i++) {
                failedFixtures[i].addEventListener("click", function () {
                    for (var j = 0; j < acc.length; j++) {
                        failed[j].nextElementSibling.style.display = "block";
                        failed[j].nextElementSibling.nextElementSibling.style.display = "block";
                    }
                });
            }

            // Show only Failed Fixtures and Hide the rest
            filterFail.addEventListener("click", function () {
                for (var i = 0; i < acc.length; i++) {
                    if(acc[i].getAttribute("name") !== "fixture-Failed") {
                        if(acc[i].style.display !== "none") {
                            acc[i].style.display = "none";
                        } else {
                            acc[i].style.display = "block";
                        }
                    }
                }
            });

            // Show only Passed Fixtures and Hide the rest
            filterPassed.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    if(acc[i].getAttribute("name") !== "fixture-Passed") {
                        if(acc[i].style.display !== "none" ) {
                            acc[i].style.display = "none";
                        } else {
                            acc[i].style.display = "block";
                        }
                    }
                }
            });

            // Show only Skipped Fixtures and Hide the rest
            filterSkipped.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    if(acc[i].getAttribute("name") !=="fixture-Skipped" ) {
                        if(acc[i].style.display !=="none" ) {
                            acc[i].style.display="none" ;
                        } else {
                            acc[i].style.display="block" ;
                        }
                    }
                }
            });

            // Clear all Filters
            filterTotal.addEventListener("click", function() {
                for(var i = 0; i < acc.length; i++) {
                    acc[i].style.display="block" ;
                }
            });

            </script>
        </body>
    </html>
    `;
};

const cssStyle = `
table {
    width: 80%;
    border-collapse: collapse;
}

table.reportSummary, table.legendTable {
    width: 50%;
	border-collapse: collapse;
    margin: 25px auto;
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

table.legendTable td {
    border: 0;
}

.accordian {
    cursor: pointer;
    padding: 18px;
    width: 100%;
	text-align: center;
    border: 1px solid white;
    transition: 0.4s;
	font-size: 18px;
    font-weight: bold;
}

.toggle-all {
    cursor: pointer;
    padding: 18px;
    width: 200px;
    text-align: center;
    border: 1px solid black;
    transition: 0.4s;
    font-size: 12px;
    font-weight: bold;
    margin: 20px 0px 20px;
    padding: 10px 0px 10px;
}

.filterBtn {
    cursor: pointer;
    padding: 10px;
    border: none;
    text-align: center;
    text-decoration: underline;
    font-size: 18px;
    background: #3498db;
    color: white;
	font-weight: bold;
}

.panel {
    padding: 10px 0px 10px;
    width: 80%;
    margin: 15px auto;
    display: none;
}

table.tests {
    display: none;
}

.reportSummary tr td, th {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
    font-size: 18px;
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
}`;

const expandAndCollapseButtons = `
    <button class="toggle-all" name="expand">EXPAND ALL</button>
    <button class="toggle-all" name="collapse">COLLAPSE ALL</button>
    <button class="toggle-all" name="expand-fixtures-Failed">EXPAND FAILED FIXTURES</button>
`;

const status = {
    passed: 'Passed',
    skipped: 'Skipped',
    failed: 'Failed',
};

const statusColors = {
    passed: '#2cc16a',
    skipped: '#e6a602',
    failed: '#e65202',
};

const symbols = {
    fixtures: '&#128301;',
    tests: '&#127776;',
    browserLogs: '&#128187;',
    httpRequests: '&#128376;',
    testInfo: '&#128712;',
    greenTick: '&#9989;',
    redCross: '&#10060;',
    slashChar: '&#92;',
};

function flushFixtures(fixtures) {
    const rows = [];
    fixtures.forEach((fixture, index) => {
        let fixtureBgColor = statusColors.passed;
        let nameTag = `fixture-${status.passed}`;
        fixture.tests.find((test) => {
            if (test.skipped) {
                fixtureBgColor = statusColors.skipped;
                nameTag = `fixture-${status.skipped}`;
                return true;
            } else if (test.errs.length > 0) {
                fixtureBgColor = statusColors.failed;
                nameTag = `fixture-${status.failed}`;
                return true;
            }
        });
        // const elementIdentifier = `fixture${index + 1}`;
        const tableData = `
            <button class = "accordian" name="${nameTag}" style = "background-color:${fixtureBgColor};color:white;">${
            symbols.fixtures
        } FIXTURE: ${fixture.name}</button>
            <div class="panel" style="text-align: center;font-weight: bold;color: #100f0f;">
            &#128736; TEST RESULT FOR &#128736;</div>
            <table class="tests">
            ${flushTests(fixture.tests)}
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
    const logHead = (message) => `<tr><td class = "logHead" colspan="5">${message}</td></tr>`;
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

    rows.push(logHead('TEST HOOK: BEFORE TEST'));
    beforeTestIndex !== -1
        ? log.slice(beforeTestIndex + 1, testIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push(logHead('NO LOG FOUND'));
    if (beforeHookErrs.length > 0) {
        beforeHookErrs.forEach((err) => rows.push(formatError(err)));
    }

    rows.push(logHead('TEST BODY'));
    testIndex !== -1
        ? log.slice(testIndex + 1, afterTestIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push(logHead('NO LOG FOUND'));
    if (testHookErrs.length > 0) {
        testHookErrs.forEach((err) => rows.push(formatError(err)));
    }

    rows.push(logHead('TEST HOOK: AFTER TEST'));
    afterTestIndex !== -1
        ? log.slice(afterTestIndex + 1, log.length - 1).forEach((lineItem) => rows.push(formatTestLog(lineItem)))
        : rows.push(logHead('NO LOG FOUND'));
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
            : screenshotPath.split(`reports/`)[1];
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
