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
        await page.setViewport({ width: 1080, height: 1024 });
        console.log('logging In....')
        await page.goto(`https://business.facebook.com/pub/properties?business_id=`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('#email');
        const emailInput = await page.$('#email');
        await emailInput.click({ clickCount: 3 });
        await emailInput.type(email);
        await page.waitForSelector('#pass');
        const passInput = await page.$('#pass');
        await passInput.click({ clickCount: 3 });
        await passInput.type(password);
        await page.click('#loginbutton');
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

const createApp = async ({ app_url, page, propertyName }, reAttempt) => {
    try {
        console.log('Creating App...')
        //code
        await page.goto(`https://business.facebook.com/pub/properties?business_id=`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('div.x2lah0s > div > div > div > a');
        await page.click('div.x2lah0s > div > div > div > a')
        await page.waitForSelector('._58al');
        await page.type('._58al', propertyName);
        await page.click('.x1pi30zi > div > button')
        await page.waitForSelector('._2wl2._2wl3._2wl4:nth-of-type(2)');
        await page.click('._2wl2._2wl3._2wl4:nth-of-type(2)');
        await page.waitForSelector('.x19lwn94 > div > div > input');
        for (let i = 0; i < app_url.length; i++) {
            await page.type('.x19lwn94 > div > div > input', app_url[i])
            await delay(10)
            if (i === app_url.length - 2) await delay(2000)
        }
        await delay(5000);
        await page.click('div.x1y1aw1k > div > div');
        while(!(await page.$$('div.x1y1aw1k > div > div:nth-of-type(2)')).length){
            await delay(1000)
            await page.click('div.x1y1aw1k > div > div');
        }
        await page.waitForSelector('div.x1y1aw1k > div > div:nth-of-type(2)');
        await page.click('div.x1y1aw1k > div > div:nth-of-type(2)');
        while(!(await page.$$('.xo71vjh > div > div > div > div')).length){
            await delay(1000)
            await page.click('div.x1y1aw1k > div > div:nth-of-type(2)');
        }
        await page.waitForSelector('.xo71vjh > div > div > div > div');
        await page.click('.xo71vjh > div > div > div > div');
        (await page.$$('div.x1iyjqo2.xamitd3 > div > div'))[10].click()
        await page.waitForSelector('div._3qn7._61-3 > span');

        // await page.type('.x19lwn94 > div > div > input', app_url+'a')
        const appId = await page.$eval('div._3qn7._61-3 > span', el => el.innerText);
        console.log('App created:', appId)
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
        const placementIndeces = {
            "banner":1,
            "interstitial":2,
            "medium rectangle":3,
            "native":4,
            "native banner":5,
            "rewarded interstital":6
        }
        for (const {placementType, placementName}of placements) {
            await page.waitForSelector('div._3qn7._61-0 > div > div.xxymvpz:nth-of-type(2)');
            await page.click('div._3qn7._61-0 > div > div.xxymvpz:nth-of-type(2)');
            await page.waitForSelector('div > div > div > input');
            await page.type('div > div > div > input', placementName);
            await page.waitForSelector('.xexx8yu > div:nth-child(3) > div > div > div > div:nth-child(1) > div');
            await page.waitForSelector(`.x78zum5.x152qxlz:nth-of-type(${placementIndeces[placementType]})`)
            await page.click(`.x78zum5.x152qxlz:nth-of-type(${placementIndeces[placementType]})`);
            await page.waitForSelector('div.x1qjc9v5 > div > div > div > div > div.xeuugli.x2lwn1j > div > div:nth-child(2) > div')
            await page.click('div.x1qjc9v5 > div > div > div > div > div.xeuugli.x2lwn1j > div > div:nth-child(2) > div');
            await delay(2000)
        }
        await delay(1000);
        await page.click('div.xh8yej3 > div:nth-child(4) > div > div > div:nth-child(2) > div')


        console.log('placements created!')
        return true;
    } catch (e) {
        console.log('Placement creation failed!');
        console.log(e)
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
    await createPlacements({ ...args, appId })
        await browser.close();
})();
