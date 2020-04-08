import { apiRequestLogger, testLogger, testStep, it, logFailureMessage } from '../../utilities/loggers/testLogger';
import { Selector } from 'testcafe';
import { getCurrentUrl } from '../../utilities/helper';

const httpLogger: RequestLogger = apiRequestLogger();

fixture`Origin Energy Website Smoke Test on "${process.env.device}: ${process.env.browser}"`
    .meta({
        type: 'smoke',
        suite: 'origin',
    })
    .requestHooks(httpLogger);

test
    .before(async (test) => {
        await testLogger(test, httpLogger, async () => {
            await test.maximizeWindow();
            await testStep(`Goto Origin Energy's website`, async () => {
                await test.navigateTo('https://www.originenergy.com.au/');
                await it(`should load Origin's logo`, async () => {
                    await test.expect(Selector('a[href="/"]').nth(0).exists).ok();
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
    })('Origin Energy Website Verification', async (test) => {
    await testLogger(test, httpLogger, async () => {
        let menuItem: Selector;
        await testStep('On Origin website, verify First Menu Item', async () => {
            menuItem = Selector('a[data-id="fly:for home:l0:for home"]');
            await it(`should have first menu name as For Home`, async () => {
                await test.expect(menuItem.innerText).eql('For Home', logFailureMessage('First Menu Name was not For Home'));
            });
        });

        await testStep('On Origin website, verify Second Menu Item', async () => {
            menuItem = Selector('a[data-id="fly:for home:l0:for business"]');
            await it(`should have second menu name as For Business`, async () => {
                await test.expect(menuItem.innerText).eql('For Business', logFailureMessage('Second Menu Name was not For Business'));
            });
        });

        await testStep('On Origin website, verify Third Menu Item', async () => {
            menuItem = Selector('a[data-id="fly:for home:l0:about origin"]');
            await it(`should have third menu name as About Origin`, async () => {
                await test.expect(menuItem.innerText).eql('About Origin', logFailureMessage('Third Menu Name was not About Origin'));
            });
        });
    });
});
