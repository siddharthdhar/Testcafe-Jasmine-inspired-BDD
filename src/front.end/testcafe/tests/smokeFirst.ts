import { apiRequestLogger, testLogger, testStep, it, logFailureMessage } from '../loggers/testLogger';
import { Selector } from 'testcafe';
import { getCurrentUrl } from '../utilities/helper';

const httpLogger: RequestLogger = apiRequestLogger();

fixture`AGL Website Smoke Test on "${process.env.device}: ${process.env.browser}"`
    .meta({
        type: 'e2e',
        suite: 'agl',
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
                await it(`should land on Google's web page`, async () => {
                    await test.expect(await getCurrentUrl()).contains('google.com');
                });
            });
        });
    })('AGL Website Verification', async (test) => {
    await testLogger(test, httpLogger, async () => {
        const landingPage = {
            myAccount: Selector('.primary-nav__button--account'),
            menuItem: Selector('.primary-nav-links__item'),
            subMenuItem: Selector('primary-nav__tertiary-item')
        }

        const myAccountPage = {
            emailInput: Selector('input'),
            privacyPolicy: Selector(('.identity-footer__item a')).nth(0)
        }

        await testStep('On AGL website, click My Account', async () => {
            await test.click(landingPage.myAccount);
            await it(`my account page should have Privacy Policy Link`, async () => {
                await test.expect(myAccountPage.privacyPolicy.exists).ok(logFailureMessage('Privacy not found on page'), {timeout: 30000});
                await test.expect(myAccountPage.privacyPolicy.innerText).eql('Privacy');
            });
        });
        await testStep('On My Account page, click Privacy', async () => {
            await test.click(myAccountPage.privacyPolicy);
            await it(`should land on Privacy Policy Page`, async () => {
                const docURI = await test.eval(() => document.documentURI)
                await test.expect(docURI).eql('https://www.agl.com.au/privacy-policy');
            });
            await test.closeWindow();
        });
        await testStep('Input email in the email box', async () => {
            await test.typeText(myAccountPage.emailInput, 'test@testmail.com');
            await it(`my account page should have Privacy Policy Link`, async () => {
                await test.expect(myAccountPage.privacyPolicy.innerText).eql('Privacy');
            });
        });

    });
    
});
