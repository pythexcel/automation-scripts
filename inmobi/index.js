const puppeteer = require('puppeteer');
const config = require('./config.json');
const {email, password, app_url, app_name} = config;

const waitForResponse = (page, url) => {
  return new Promise(resolve => {
      page.on("response", function callback(response){
          if (response.url() === url) {
              resolve(response);
              page.removeListener("response",callback)
          }
      })
  })
};
const delay=(time)=>{
  return new Promise(function(resolve) { 
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
  
  


(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await windowSet(page,'pass',password)
  await page.goto('https://publisher.inmobi.com/signup', {waitUntil:'networkidle0'});
  

  // Set screen size
  await page.setViewport({width: 1080, height: 1024});
  
  await page.waitForSelector('button');
  await page.click('button');
  await page.waitForSelector('#email');
  await page.type('#email', email);
  await page.$eval('#btn-next',async(el)=>{
    console.log(el)
    await setTimeout(()=>{
      el.click()
    },1000)
    
  })
  
  await waitForResponse(page,`https://iam.inmobi.com/iam/v3/user/getAuth0UserDetails?email=${email}`);
  await page.exposeFunction('#password',()=>{});
  await page.waitForSelector('#password');
  await page.$eval('#password', async(el) =>{
    await setTimeout(()=>{
      el.value = pass;
    },1000)
  });
  await page.$eval('#btn-login', async(el) =>{
    await setTimeout(()=>{
      el.click()
    },1000)
  });
  await page.waitForSelector('.css-1wuxrsi');
  await page.$eval('.css-1wuxrsi',(el)=>{
    el.click()
  })
  await page.waitForSelector('.css-1c2j7dd');
  await page.$eval('.css-1c2j7dd',(el)=>{
    el.click()
  })
  await page.waitForSelector('.field__input');
  await delay(2000)
  await page.type(".field__input",app_url)
  await waitForResponse(page,"https://publisher.inmobi.com/api/graphql");
  let inputs = await page.$$(".field__input")
  inputs[1].click({ clickCount: 3 })
  await delay(2000)
  inputs[1].type(app_name);
  await page.waitForSelector('.css-1wuxrsi');
  await page.$eval('.css-1wuxrsi',(el)=>{
    el.click()
  })
  await waitForResponse(page,"https://publisher.inmobi.com/api/graphql");
  await page.waitForSelector('#radio-gdpr-true');
  await page.waitForSelector('#radio-location-true');
  await waitForResponse(page,"https://publisher.inmobi.com/api/graphql");
  await page.waitForSelector('#radio-gdpr-true');
  await page.$eval('#radio-gdpr-true',(el)=>{
    el.click()
  })
  await page.waitForSelector('#radio-location-true');
  await page.$eval('#radio-location-true',(el)=>{
    el.click()
  })
  await delay(2000)
  await page.waitForSelector('.css-1wuxrsi');
  await page.$eval('.css-1wuxrsi',(el)=>{
    el.click()
  })

})();
