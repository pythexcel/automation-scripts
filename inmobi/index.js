const puppeteer = require('puppeteer');
const config = require('./config.json');


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
    await page.goto('https://publisher.inmobi.com/signup', { waitUntil: 'networkidle0' });

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });
    console.log('logging In....')
    await page.waitForSelector('button');
    await page.click('button');
    await page.waitForSelector('#email');
    await page.type('#email', email);
    await page.$eval('#btn-next', async (el) => {
      await setTimeout(() => {
        el.click()
      }, 1000)

    })

    await waitForResponse(page, `https://iam.inmobi.com/iam/v3/user/getAuth0UserDetails?email=${email}`);
    await page.exposeFunction('#password', () => { });
    await page.waitForSelector('#password');
    await page.$eval('#password', async (el) => {
      await setTimeout(() => {
        el.value = pass;
      }, 1000)
    });
    await page.$eval('#btn-login', async (el) => {
      await setTimeout(() => {
        el.click()
      }, 1000)
    });
    await page.waitForSelector('.css-1wuxrsi');
    console.log('logged In')
  }
  catch (e) {
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
const createApp = async ({ app_url, app_name, page }, reAttempt) => {
  try {
    console.log('Creating App...')
    await page.goto('https://publisher.inmobi.com/my-inventory/app-and-placements', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.css-1wuxrsi');
    await page.$eval('.css-1wuxrsi', (el) => {
      el.click()
    })
    await page.waitForSelector('.css-1c2j7dd');
    await page.$eval('.css-1c2j7dd', (el) => {
      el.click()
    })
    await page.waitForSelector('.field__input');
    await delay(2000)
    await page.type(".field__input", app_url)
    await waitForResponse(page, "https://publisher.inmobi.com/api/graphql");
    const inputs = await page.$$(".field__input")
    inputs[1].click({ clickCount: 3 })
    await delay(2000)
    inputs[1].type(app_name);
    await page.waitForSelector('.css-1wuxrsi');
    await page.$eval('.css-1wuxrsi', (el) => {
      el.click()
    })
    await waitForResponse(page, "https://publisher.inmobi.com/api/graphql");
    await page.waitForSelector('#radio-gdpr-true');
    await page.waitForSelector('#radio-location-true');
    await waitForResponse(page, "https://publisher.inmobi.com/api/graphql");
    await page.waitForSelector('#radio-gdpr-true');
    await page.$eval('#radio-gdpr-true', (el) => {
      el.click()
    })
    await page.waitForSelector('#radio-location-true');
    await page.$eval('#radio-location-true', (el) => {
      el.click()
    })
    await delay(2000)
    await page.waitForSelector('.css-1wuxrsi');
    await page.$eval('.css-1wuxrsi', (el) => {
      el.click()
    })
    await page.waitForNavigation();
    await page.waitForSelector('.css-ceuxau');
    const pageUrl = await page.url();
    const appId = pageUrl.split('/')[pageUrl.split('/').length - 1];
    console.log('App created:', appId)
    return appId;
  } catch (e) {
    console.log('App creation failed!');
    if (!reAttempt) reAttempt = 0;
    if (reAttempt < 5) {
      reAttempt += 1
      console.log(`reattempt ${reAttempt} out of 5`);
      return await createApp({ app_url, app_name, page }, reAttempt)
    }
    throw e;
  }

}

const createPlacements = async ({ page, appId, placements }, reAttempt) => {
  try{
    await page.goto(`https://publisher.inmobi.com/my-inventory/app-and-placements/create-placement/${appId}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.css-cb9ru8');
  const placementElements = await page.$$(".css-cb9ru8")
  const setPlacementConfig = async (placementName, abid, partner, testMode) => {
    await page.waitForSelector('.form-control')
    await page.type('.form-control', placementName);
    let dropDowns;
    if (abid) {
      dropDowns = await page.$$('.dropdown');
      await dropDowns[0].click()
      await page.waitForSelector('.dropdown__list-item')
      await page.$eval('.dropdown__list-item', el => el.click());
      await delay(1000);
      dropDowns = await page.$$('.dropdown');
      await dropDowns[1].click();
      await page.waitForSelector('.dropdown__list-item');
      let dropDownsListItems = await page.$$('.dropdown__list-item');
      for (listItem of dropDownsListItems) {
        const text = await page.evaluate(el => el.textContent, listItem)
        if (text === partner) {
          await listItem.click();
          break;
        }
      }
      await delay(1000)
      await dropDowns[2].click();
      dropDownsListItems = await page.$$('.dropdown__list-item');
      for (listItem of dropDownsListItems) {
        const text = await page.evaluate(el => el.textContent, listItem)
        if (text === testMode) {
          await listItem.click();
          break;
        }
      }
    } else {
      dropDowns = await page.$$('.dropdown');
      await dropDowns[1].click();
      dropDownsListItems = await page.$$('.dropdown__list-item');
      for (listItem of dropDownsListItems) {
        const text = await page.evaluate(el => el.textContent, listItem)
        if (text === testMode) {
          await listItem.click();
          break;
        }
      }
    }
    await page.$eval('.css-1wuxrsi', (el) => {
      el.click()
    })
  }
  const indexOfPlacements = {
    "interstitial": 0,
    "banner": 1,
    "rewarded": 2,
    "inStream": 3,
    "native": 4
  }
  for (placement of placements) {
    const { type, placementName, audienceBidding, partner, testMode } = placement;
    await placementElements[indexOfPlacements[type]].$eval('button', el => el.click());
    await setPlacementConfig(placementName, audienceBidding, partner, testMode);
  }
  return true
  }catch(e){
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
  await createPlacements({ ...args, appId })
  await browser.close();
})();
