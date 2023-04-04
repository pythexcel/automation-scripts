const config = require('./config-maxads.json');
const axios = require('axios');
const https = require('https')
axios.defaults.headers.common['Api-Key'] = config.managementApiKey;

const createApp = async ()=>{
const createAppApiUrl = 'https://o.applovin.com/mediation/v1/ad_unit';
    const data = config.appData; 
    const response = await axios.post(createAppApiUrl,data);
    if(response.status !== 200) return false;
    console.log(response.data)
    return response.data;
    //response
    // {
    //     "id": "1234567890abcdef",
    //     "name": "My Inter Ad Unit",
    //     "platform": "ios",
    //     "package_name": "com.test.app",
    //     "ad_format": "INTER",
    //     "has_active_experiment": false, x
    //     "disabled": false x
    //  }
}

const configApp = async (app)=>{
    const { has_active_experiment, disabled, ...requestData } = {...app, ...config.appConfig};
    const createAppApiUrl = `https://o.applovin.com/mediation/v1/ad_unit/${requestData.id}`;
    const data = config.appConfig; 
    const response = await axios.post(createAppApiUrl,requestData);
    if(response.status !== 200) return false;
    console.log(response.data)
    return response.data;
}



(async ()=>{
    const app = await createApp();
    if(!app){
        console.log("An Error occured while creating a app");
        return false
    }
    configApp(app);
})();