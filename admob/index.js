const puppeteer = require('puppeteer-extra')
const config = require('./config.json');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

//helper functions
const waitForResponse = (page, url) => {
    return new Promise(resolve => {
        page.on("response", function callback(response) {
            if (response.url() === url) {
                resolve(response);
                page.removeListener("response", callback)
            }
        })
    })
};
const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const windowSet = async (page, name, value) => {
    await page.evaluateOnNewDocument((name, value) => {
        Object.defineProperty(window, name, {
            value: value,
            configurable: true
        });
    }, name, value);
};

////////////////
const login = async ({ page, email, password }, reAttempt) => {
    try {
        await windowSet(page, 'pass', password)
        // Set screen size
        await page.setViewport({ width: 1080, height: 1024 });
        console.log('logging In....')
        await page.goto('https://accounts.google.com/v3/signin/identifier?dsh=S-419050728%3A1681109023429182&continue=https%3A%2F%2Fapps.admob.com%2Fv2%2Fhome&flowEntry=ServiceLogin&flowName=GlifWebSignIn&followup=https%3A%2F%2Fapps.admob.com%2Fv2%2Fhome&ifkv=AQMjQ7QXrWOt3C65ye4VOca0gxUYqPyEnhaQ8z7FLJNv1_kUp7XtvCVft60ntH9pZKVIBXEL6Che-Q&osid=1&passive=1209600&service=admob', { waitUntil: 'networkidle0' });
        await page.waitForSelector('#identifierId');
        await page.type('#identifierId',email);
        await page.click('#identifierNext > div > button');
        await waitForResponse(page, `https://play.google.com/log?format=json&hasfast=true`);
        await page.waitForSelector('#password');
        await delay(2000)
        await page.$eval('.zHQkBf',el=>el.value=pass);
        await delay(2000)
        await page.click('#passwordNext > div > button');
        await page.waitForNavigation();
        console.log('logged In')
    }
    catch (e) {
        console.log(e)
        console.log('login failed!');
        if (!reAttempt) reAttempt = 0;
        if (reAttempt < 5) {
            reAttempt += 1
            console.log(`reattempt ${reAttempt} out of 5`);
            return await login({ page, email, password }, reAttempt)
        }
        throw e;
    }

}
const createApp = async ({ app_url, page }, reAttempt) => {
    try {
        console.log('Creating App...')
        await page.goto('https://apps.admob.com/v2/home', { waitUntil: 'networkidle0' });
        await page.waitForSelector('#app-picker-sidebar-item');
        await page.click('#app-picker-sidebar-item');
        await page.waitForSelector('.add-app-button');
        await delay(2000)
        await page.click('.add-app-button');
        await page.waitForSelector('.ripple');
        const radios = await page.$$(".ripple");
        await radios[0].click();
        await radios[2].click();
        await page.waitForSelector('.btn-yes');
        await page.click('.btn-yes');
        await page.waitForSelector('.input-area');
        await delay(2000)
        await page.type('.input-area',app_url);
        await page.click('.search-button');
        await page.waitForResponse('https://apps.admob.com/cam/_/rpc/AppService/Search?authuser=0');
        await page.waitForSelector('app-select-cell > material-button');
        await page.click('app-select-cell > material-button');
        await page.waitForSelector('.btn-yes');
        await page.click('.btn-yes')
        await delay(2000)
        await page.waitForSelector('.btn-yes');
        await page.click('.btn-yes')
        await page.waitForSelector('success-page > material-button');
        await page.click('success-page > material-button');
        await page.waitForSelector('.card-illustration');
        const pageUrl = await page.url();
        const appId = pageUrl.split('/')[pageUrl.split('/').length - 2];

        console.log('App created:',appId)
        return appId;
    } catch (e) {
        console.log(e)
        console.log('App creation failed!');
        if (!reAttempt) reAttempt = 0;
        if (reAttempt < 5) {
            reAttempt += 1
            console.log(`reattempt ${reAttempt} out of 5`);
            return await createApp({ app_url, page }, reAttempt)
        }
        throw e;
    }

}

const createPlacements = async ({ page, appId, placements }, reAttempt) => {
    try {
        console.log('creating placements')

        console.log('placements created!')
        return true;
    } catch (e) {
        console.log('Placement creation failed!');
        if (!reAttempt) reAttempt = 0;
        if (reAttempt < 5) {
            reAttempt += 1
            console.log(`reattempt ${reAttempt} out of 5`);
            return await createPlacements({ page, appId, placements }, reAttempt)
        }
        throw e;
    }
}



(async () => {
    const browser = await puppeteer.launch({ headless: config.isHeadLess });
    const page = await browser.newPage();
    const args = { ...config, page }
    await login(args);
    const appId = await createApp(args)
    // await createPlacements({ ...args, appId })
    // await browser.close();
})();
