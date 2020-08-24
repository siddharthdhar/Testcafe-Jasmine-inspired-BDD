# Introduction

This document details the structure and workings of the this Test Automation Framework using TestCafe

## Installing

1. Download and install the following tools:
    * [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) or
    * [nvm-osx-linux](https://github.com/creationix/nvm) (or use `brew install nvm`)

1. Open up a new shell and run the following in the repository root

```bash
$ nvm install node
$ nvm use node

# Install yarn globally
$ npm i yarn -g

# install all dependencies
$ yarn install
```

## Framework Structure

1. **Config**: `src/config/testcafe.js`

    * Test cafe does not support a config.js file for its entry into the tests like Protractor. Hence we need to capture all the arguments from commandline beforehand, process them and place them in the right context through this testcafe.js file.
    * Testcafe supports config.json instead and test runners. More details can be found here: [<https://devexpress.github.io/testcafe/documentation/using-testcafe/configuration-file.html]>

2. **Tests**: `src/front.end/testcafe/test`: Organising Your Tests:

    1. Fixtures:

        * Can be organised as a Feature
        * **metadata** is mandatory and should specify ***type*** of test, ***suite*** name
        * Always provide TestCafe RequestLogger as a part of requestHooks. This will keep a track of  all http requests and responses. For more details read: [<https://devexpress.github.io/testcafe/documentation/test-api/intercepting-http-requests/logging-http-requests.html>]

        ```typescript
        const httpLogger = RequestLogger('https://example.com/');
        fixture(`FEATURE DESCRIPTION`)
        .meta({
            type: 'e2e',
            suite: 'google'
        })
        .requestHooks(httpLogger);
        ```

    1. Tests:
        * Should be written under a fixture
        * A fixture can have multiple tests
        * Can be organised as multiple scenarios of a feature
        * **metadata** is optional. May specify ***spec*** Name to uniquely identify test, ***device*** as Mobile if the test can be run on a mobile device.

    1. More details about Tests and Fixtures can be found here: [<https://devexpress.github.io/testcafe/documentation/test-api/test-code-structure.html#fixtures]>

    1. LOGS:
        * testLogger: Should be initiated in every phase (Before, After, Test) of test. This function tracks the phase of test and releases the logs to console in case of test completion or test failing in before or after hooks.
        * httpLogger: Should be passed to testLogger, every time testLogger is called. This will keep track of all the http request and responses. This will log responses that do not have status code 200 or 302
        * testStep: Should be called to log a test step
        * it: should be called to log assertions

        ```typescript
        test
        .meta({
            spec: 'randomTest'
            device: DeviceType.Mobile
        })
        .before(async (t) => {
            await testLogger(t, httpLogger, async() =>{
                await testStep('Login to application', async () => {
                    await login();
                });
            });
        })
        .after(async () => {
            await testLogger(t, httpLogger, async() =>{
                await testStep('Logout from application', async () => {
                    await logout();
                });
            });
        })('Scenario Description', async (t) => {
            await testLogger(t, httpLogger, async() =>{
                await testStep('Click on some link and verify something', async () => {
                    await t.click('.SomeLink');
                    it('should show header', async() => {
                        await t.expect(Selector('.header').innerText).eql('Some Header', logFailureMessage('Header title does not equal Some Header'));
                    });
                    it('should show some title', async() => {
                        await t.expect(Selector('.title').innerText).eql('Some TITLE', logFailureMessage('title does not equal Some Title'));
                    });
                });
            });
        );

        ```

    1. REPORTS: The framework outputs Spec, JSON and HTML Reports in the reports folder once tests are run.
         * HTML Report: contains the Logs, Test Results and Screenshots. This is a custom reporter which is different from HTML reporter recommended by Test Cafe.
         * Custom HTML report:
            * ReportSummary:

            ![Report Summary](https://i.imgur.com/Wqy8c68h.png)

            * Detailed View:

            ![Detailed Summary](https://i.imgur.com/PzNkfjBh.png)
            
          * Custom Spec Report:
          
          ![custom spec report](https://i.imgur.com/X8V0u87h.png)

## RUN TESTS

1. Help:
```console
yarn e2e -h
yarn e2e --help
```

1. To Run All tests: [***Chrome*** is selected by ***default*** and only desktop browser specific tests will run]

```console
yarn e2e
```

1. To Run Tests on specific browser:

```console
$ yarn e2e -b "Browser_Name"
$ yarn e2e -browser "Browser_Name"
example: yarn e2e -b "firefox"
```

1. To Run Tests headless on chrome: [<https://devexpress.github.io/testcafe/documentation/using-testcafe/common-concepts/browsers/testing-in-headless-mode.html]>

```console
yarn e2e -b "chrome:headless"
```

1. Find all saucelabs related browser configuration:

```console
yarn testcafe -b saucelabs
```

1. To Run Tests on Saucelabs browser

```console
$ yarn e2e -b "saucelabs:browser_os_configuration"
$ yarn e2e --browser "saucelabs:browser_os_configuration"
example: yarn e2e -b "saucelabs:Chrome@beta:OS X 10.10"
```

1. To Run Tests on Saucelabs mobile : This will run tests with ***metadata as "device: Mobile"***

```console
$ yarn e2e -b "saucelabs:browser_os_configuration"
$ yarn e2e --browser "saucelabs:browser_os_configuration"
example: yarn e2e -b "saucelabs:iPhone 7 Plus Simulator@13.0"
```

1. To Run Tests on Chrome Emulator : This will run tests with ***metadata as "device: Mobile"***

```console
$ yarn e2e -b "chrome:emulation:device=Emulation_Device"
$ yarn e2e --browser "chrome:emulation:device=Emulation_Device"
example: yarn e2e -b "chrome:emulation:device=iphone X"
```

1. To Run Tests specific to a feature: This will run tests with ***metadata "suite: YOUR_FEATURE"***

```console
$ yarn e2e --suite YOUR_FEATURE
$ yarn e2e -S YOUR_FEATURE
example: yarn e2e --suite billSmoothing
```

1. To Run Tests in Parallel:

```console
$ yarn e2e --concurrency NUMBER
$ yarn e2e -c NUMBER
example: yarn e2e -c 5
```

1. To take screenshots on Failure: pass --screenshot as CLI argument

```console
yarn e2e --screenshot
```

1. To Run Tests in Quarantine Mode: pass -q or -- as CLI argument

```console
$ yarn e2e --quarantineMode
$ yarn e2e -q
example: yarn e2e -q
```

"# testcafe.poc"
