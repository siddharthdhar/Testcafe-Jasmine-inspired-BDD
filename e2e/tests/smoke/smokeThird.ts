import { apiRequestLogger, testLogger, testStep, it, logFailureMessage } from '../../utilities/loggers/testLogger';
import { Selector } from 'testcafe';
import { getCurrentUrl } from '../../utilities/helper';

const httpLogger: RequestLogger = apiRequestLogger();

fixture`Energy Australia Website Smoke Test on "${process.env.device}: ${process.env.browser}"`
    .meta({
        type: 'smoke',
        suite: 'energyAustralia',
    })
    .requestHooks(httpLogger);

test
    .before(async (test) => {
        await testLogger(test, httpLogger, async () => {
            await test.maximizeWindow();
            await testStep(`Goto Energy Australia's website`, async () => {
                await test.navigateTo('https://www.energyaustralia.com.au/');
                await it(`should load Energy Australia's logo`, async () => {
                    await test.expect(Selector('.site-logo').filterVisible().exists).ok();
                });
            });
        });
    })
    .after(async (test) => {
        await testLogger(test, httpLogger, async () => {
            await testStep('Navigate to Google', async () => {
                await test.navigateTo('https://google.com.au');
                await it(`should land on Google's web page`, async () => {
                    await test.expect(await getCurrentUrl()).contains('google.com');
                });
            });
        });
    })('Energy Australia Website Verification', async (test) => {
    await testLogger(test, httpLogger, async () => {
        const menuItem = Selector('.megamenu-link');
        const subMenu = Selector('.megamenu-child');
        await testStep('On Energy Australia website, verify First Menu Item', async () => {
            await test.hover(menuItem.nth(0));
            await it(`should have first menu name as Electricity and gas`, async () => {
                await test
                    .expect(menuItem.nth(0).innerText)
                    .eql('Electricity and gas', logFailureMessage('First Menu Name was not Electricity and gas'));
            });
            await it(`should contain "Compare electricity and gas" in its's sub menu`, async () => {
                await test
                    .expect(subMenu.nth(0).innerText)
                    .contains('Compare electricity and gas', logFailureMessage('Sub Menu does not contain Compare electricity and gas'));
            });
        });

        await testStep('On Energy Australia website, verify Second Menu Item', async () => {
            await test.hover(menuItem.nth(1));
            await it(`should have second menu name as Moving house`, async () => {
                await test
                    .expect(menuItem.nth(1).innerText)
                    .eql('Moving house', logFailureMessage('Second Menu Name was not Moving house'));
            });
            await it(`should contain "Make it a good move" in its's sub menu`, async () => {
                await test
                    .expect(subMenu.nth(1).innerText)
                    .contains('Make it a good move', logFailureMessage('Sub Menu does not contain Make it a good move'));
            });
        });

        await testStep('On Energy Australia website, verify Third Menu Item', async () => {
            await test.hover(menuItem.nth(2));
            await it(`should have third menu name as Bills and accounts`, async () => {
                await test
                    .expect(menuItem.nth(2).innerText)
                    .eql('Bills and accounts', logFailureMessage('Third Menu Name was not Bills and accounts'));
            });
            await it(`should contain "Manage your account" in its's sub menu`, async () => {
                await test
                    .expect(subMenu.nth(2).innerText)
                    .contains('Manage your account', logFailureMessage('Sub Menu does not contain Manage your account'));
            });
        });
    });
});
