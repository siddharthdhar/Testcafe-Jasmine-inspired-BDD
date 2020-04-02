import { apiRequestLogger, testLogger, testStep, it, logFailureMessage } from "../../utilities/loggers/testLogger";
import { Selector } from 'testcafe';
import { getCurrentUrl } from '../../utilities/helper';

const httpLogger: RequestLogger = apiRequestLogger();

fixture`AGL Website Smoke Test on "${process.env.device}: ${process.env.browser}"`
    .meta({
        type: 'smoke',
        suite: 'agl'
    })
    .requestHooks(httpLogger);

test
    .before(async (test) => {
        await testLogger(test, httpLogger, async () => {
            await test.maximizeWindow();
            await testStep(`Goto AGL's website`, async () => {
                await test.navigateTo('https://agl.com.au');
                await it(`should load AGL's logo`, async () => {
                    await test.expect(Selector('.header__logo').exists).ok();
                });
            });
        });
    })
    .after(async (test) => {
        await testLogger(test, httpLogger, async () => {
            await testStep('Navigate to Google', async () => {
                await test.navigateTo('https://google.com.au');
                await it(`should land on Google's web page`, async() => {
                    await test.expect(await getCurrentUrl()).contains('google.com');
                })
            });
        });
    })('AGL Website Verification', async (test) => {
    await testLogger(test, httpLogger, async () => {
        const menuItem = Selector('.primary-nav-links__item');
        const subMenuItem = Selector('primary-nav__tertiary-item');
        await testStep('On AGL website, hover over First Menu Item', async () => {
            await test.hover(menuItem.nth(0));
            await it(`should have first menu name GET CONNECTED`, async() => {
                await test.expect(menuItem.nth(0).innerText).eql('GET CONNECTED', logFailureMessage('First Menu Name was not GET CONNECTED'));
            })
            await it(`should have first sub menu item name Electricity & Gas Plans`, async() => {
                await test.expect(subMenuItem.nth(0).innerText).eql('Electricity & Gas Plans', logFailureMessage('First Sub Menu Name was not Electricity & Gas Plans'));
            })
        });

        await testStep('On AGL website, hover over Second Menu Item', async () => {
            await test.hover(menuItem.nth(1));
            await it(`should have second menu name SOLAR AND RENEWABLES`, async() => {
                await test.expect(menuItem.nth(1).innerText).eql('SOLAR AND RENEWABLES', logFailureMessage('Second Menu Name was not SOLAR AND RENEWABLES'));
            })
            await it(`should have first sub menu item name Electricity & Gas Plans`, async() => {
                await test.expect(subMenuItem.nth(0).innerText).eql('Solar Energy', logFailureMessage('First Sub Menu Name was not Solar and Renewables'));
            })
        });

        await testStep('On AGL website, hover over Third Menu Item', async () => {
            await test.hover(menuItem.nth(2));
            await it(`should have menu name BUSINESS`, async() => {
                await test.expect(menuItem.nth(2).innerText).eql('BUSINESS', logFailureMessage('Third Menu Name was not BUSINESS'));
            })
            await it(`should have sub menu item name Electricity & Gas Plans`, async() => {
                await test.expect(subMenuItem.nth(0).innerText).eql('Electricity & Gas Plans', logFailureMessage('First Sub Menu Name was not Electricity & Gas Plans'));
            })
        });
    });
});
