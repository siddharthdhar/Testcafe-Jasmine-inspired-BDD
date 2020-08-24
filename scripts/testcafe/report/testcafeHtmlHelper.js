module.exports.flushFixtures = function(fixtures) {
    const rows = [];
    fixtures.forEach((fixture, index) => {
        let nameTag = `fixture-${status.passed}`;
        let bgClassName = 'fixture-test-passed';
        fixture.tests.find((test) => {
            if (test.skipped) {
                nameTag = `fixture-${status.skipped}`;
                bgClassName = 'fixture-test-skipped';
                return true;
            } else if (test.errs.length > 0) {
                nameTag = `fixture-${status.failed}`;
                bgClassName = 'fixture-test-failed';
                return true;
            }
        });
        const tableData = `
            <button class = "accordian ${bgClassName}" name="${nameTag}">${symbols.fixtures} FIXTURE: ${fixture.name}</button>
            <div class="panel">
            &#128736; TEST RESULT FOR &#128736;</div>
            <table class="tests clickable-table">
            ${flushTests(fixture)}
            </table>
        `;
        return rows.push(tableData);
    });
    return rows.join('');
};

function flushTests(fixture) {
    const rows = [];
    var tests = fixture.tests;
    let bgClassName = 'fixture-test-passed';
    var name = fixture.name.split('"')[0].replace(/\s|-/g, '');

    tests.forEach((test, index) => {
        let testStatus;
        if (test.skipped) {
            testStatus = status.skipped;
            bgClassName = 'fixture-test-skipped';
        } else if (test.errs.length > 0) {
            testStatus = status.failed;
            bgClassName = 'fixture-test-failed';
        } else {
            testStatus = status.passed;
        }
        const elementIdentifier = `${name}${index + 1}`;
        const tableData = `
        <tbody class="tests test-tbody" id="${elementIdentifier}">
        <tr class='row-header' onclick="func${elementIdentifier}(${elementIdentifier})">
            <td colspan="7" class="${bgClassName}">
                <div class="left-float">${symbols.tests} TEST: ${test.name}</div>
                <div class="right-float"><mark>[${(test.durationMs / 60000).toFixed(2)} minutes]</mark></div>
            </td>
            <td colspan="2">${testStatus}</td>
        </tr>
        ${
            test.skipped
                ? `<tr class="result-rows"><td colspan="9" class = "testInfo align-center">TEST SKIPPED</td></tr>`
                : mapErrorsToLog(test)
        }
        </tbody>
        <script>
            function func${elementIdentifier}(param){
                var alltr = param.querySelectorAll("tr");
                for (var i = 1; i < alltr.length; i++) {
                    alltr[i].style.display = (alltr[i].style.display == "none" || alltr[i].style.display == "") ? "table-row" : "none";
                }
            }
        </script>
        `;
        return rows.push(tableData);
    });
    return rows.join('');
}

function mapErrorsToLog(test) {
    const log = test.testLog;
    let isLogGenerated = !log ? false : true;
    const isFailed = !test.skipped && test.errs.length > 0;
    const logHead = (message) => {
        return isFailed
            ? `<tr class="result-rows failed-testrows"><td class = "logHead" colspan="9">${message}</td></tr>`
            : `<tr class="result-rows"><td class = "logHead" colspan="9">${message}</td></tr>`;
    };
    const beforeTestIndex =
        log && log.length > 0
            ? log.findIndex((element) => {
                  return element.includes('::TEST::BEFORE HOOK::') || element.includes('::TEST::FIXTURE BEFORE EACH HOOK::');
              })
            : -1;
    const testIndex = log && log.length > 0 ? log.findIndex((element) => element.includes('::TEST HOOK::')) : -1;
    const afterTestIndex =
        log && log.length > 0
            ? log.findIndex((element) => {
                  return element.includes('::TEST::AFTER HOOK::') || element.includes('::TEST::FIXTURE AFTER EACH HOOK::');
              })
            : -1;
    const beforeHookErrorText = 'Error in test.before hook';
    const afterHookErrorText = 'Error in test.after hook';
    const beforeEachHookErrorText = 'Error in fixture.beforeEach hook';
    const afterEachHookErrorText = 'Error in fixture.afterEach hook';
    const beforeHookErrs = [];
    const afterHookErrs = [];
    const testHookErrs = [];
    const rows = [];
    test.errs.forEach((err, index) => {
        if (err.includes(beforeHookErrorText) || err.includes(beforeEachHookErrorText)) {
            beforeHookErrs.push(err);
        } else if (err.includes(afterHookErrorText) || err.includes(afterEachHookErrorText)) {
            afterHookErrs.push(err);
        } else {
            testHookErrs.push(err);
        }
    });

    rows.push(logHead('TEST HOOK: BEFORE TEST'));
    beforeTestIndex !== -1
        ? log.slice(beforeTestIndex + 1, testIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem, isFailed)))
        : rows.push(
              logHead(
                  isLogGenerated
                      ? 'NO LOG FOUND'
                      : 'NO LOG FILE IS GENERATED FOR THIS TEST. ERRORS (IF ANY) ARE SHOWING FROM testcafe.json FILE'
              )
          );
    if (beforeHookErrs.length > 0) {
        beforeHookErrs.forEach((err) => rows.push(formatError(err, isFailed)));
    }

    rows.push(logHead('TEST BODY'));
    testIndex !== -1
        ? log.slice(testIndex + 1, afterTestIndex).forEach((lineItem) => rows.push(formatTestLog(lineItem, isFailed)))
        : rows.push(
              logHead(
                  isLogGenerated
                      ? 'NO LOG FOUND'
                      : 'NO LOG FILE IS GENERATED FOR THIS TEST. ERRORS (IF ANY) ARE SHOWING FROM testcafe.json FILE'
              )
          );
    if (testHookErrs.length > 0) {
        testHookErrs.forEach((err) => rows.push(formatError(err, isFailed)));
    }

    rows.push(logHead('TEST HOOK: AFTER TEST'));
    afterTestIndex !== -1
        ? log.slice(afterTestIndex + 1, log.length - 1).forEach((lineItem) => rows.push(formatTestLog(lineItem, isFailed)))
        : rows.push(
              logHead(
                  isLogGenerated
                      ? 'NO LOG FOUND'
                      : 'NO LOG FILE IS GENERATED FOR THIS TEST. ERRORS (IF ANY) ARE SHOWING FROM testcafe.json FILE'
              )
          );
    if (afterHookErrs.length > 0) {
        afterHookErrs.forEach((err) => rows.push(formatError(err, isFailed)));
    }

    return rows.join('');
}

function formatTestLog(logLine, isFailed) {
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
        ? isFailed
            ? `<tr class="result-rows failed-testrows"><td colspan="9" class = "${className}" ${additionalStyle}>${logLine}</td></tr>`
            : `<tr class="result-rows"><td colspan="9" class = "${className}" ${additionalStyle}>${logLine}</td></tr>`
        : isFailed
        ? `<tr class="result-rows failed-testrows"><td colspan="9" class = "logStep" ${additionalStyle}>${logLine}</td></tr>`
        : `<tr class="result-rows"><td colspan="9" class = "logStep" ${additionalStyle}>${logLine}</td></tr>`;
}

function formatError(error, isFailed) {
    let screenshotPath;
    error = JSON.stringify(error);
    // replace Javascript '\n' new line character with <br> in html
    // replace '\\' Javascript backward slash with &#92; in HTML
    error = error.replace(/\\n/g, '<br>').replace(/\\\\/g, symbols.slashChar);

    // Capture Screenshot path and split the relative path to be added to image property in html
    if (error.includes('Screenshot:')) {
        screenshotPath = error.split('Screenshot:')[1].split('<br>')[0];
        screenshotPath = screenshotPath.includes(symbols.slashChar)
            ? screenshotPath.split(`reports${symbols.slashChar}`)[1]
            : screenshotPath.split(`reports/`)[1];
    }

    const screeshotHtml = screenshotPath
        ? `
        <td class="white-space-normal" colspan="3">
            <a>
                <img border="0" alt="ERROR" src="${screenshotPath}" width="300" height="300">
            </a>
        </td>
        `
        : `<td colspan="3">NO SCREENSHOT FOUND</td>`;
    return isFailed
        ? `
            <tr class="result-rows failed-testrows">
                <td class="white-space-normal" colspan="6">
                    ${error}
                </td>
                ${screeshotHtml}
            </tr>
        `
        : `
            <tr class="result-rows">
                <td class="white-space-normal" colspan="6">
                    ${error}
                </td>
                ${screeshotHtml}
            </tr>
        `;
}

const status = {
    passed: 'Passed',
    skipped: 'Skipped',
    failed: 'Failed'
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
