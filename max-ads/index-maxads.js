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
}




(async ()=>{
    const app = await createApp();
    if(!app){
        console.log("An Error occured while creating a app");
        return false
    }

    
})();