const config = require('./config-ironsource.json');
const axios = require('axios');
const https = require('https')

const auth = async (secretkey,refreshToken)=>{
    const authUrl = 'https://platform.ironsrc.com/partners/publisher/auth';
    const configs = {
        headers:{
            secretkey: config.secretKey,
            refreshToken: config.refreshToken}
    }
    // console.log(config)
    const response = await axios.get(authUrl , configs);
    if(response.status !== 200) return false;
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data}`;
    console.log(response.data, 'token')
    return response.data;
}

const createApp = async ()=>{
const createAppApiUrl = 'https://platform.ironsrc.com/partners/publisher/applications/v6';
    const data = config.appData; 
    const response = await axios.post(createAppApiUrl,data);
    if(response.status !== 200) return false;
    return response.data;
}

const createInstances = async (app)=>{
    const {appKey} = app;
    const createInstanceApiUrl = 'https://platform.ironsrc.com/partners/publisher/instances/v3';
    const data = config.instanceData;
    data.appKey = appKey;
    const response = await axios.post(createInstanceApiUrl,data);
    if(response.status !== 200) return false;
    return response.data;
}

const createPlacements = async (app)=>{
    const {appKey} = app;
    const createPlacementApiUrl = 'https://platform.ironsrc.com.com/partners/publisher/placements/v1';
    const data = config.placementData;
    data.appKey = appKey;
    const response = await axios.post(createPlacementApiUrl,data);
    if(response.status !== 200) return false;
    return response.data;
}

const createMediation = async (app)=>{
    const {appKey} = app;
    const createMediationApiUrl = 'https://platform.ironsrc.com/partners/publisher/mediation/management/v2';
    const data = config.mediationData;
    data.appKey = appKey;
    const response = await axios.post(createMediationApiUrl,data);
    if(response.status !== 200) return false;
    return response.data;
}


(async ()=>{
    if(!(await auth())){
        console.log("auth error");
        return false
    }
    const app = await createApp();
    if(!app){
        console.log("An Error occured while creating a app");
        return false
    }
    const {useInstanceData, usePlacementData, useMediationData} = config;
    
    if(useInstanceData){
        const instances = await createInstances(app);
        if(!instances) console.log('An Error occured while creating Instances');
    } 
    if(usePlacementData){
        const placements = await createPlacements(app);
        if(!placements) console.log('An Error occured while creating Placements');
    } 
    if(useMediationData){
        const mediation = await createMediation(app);
        if(!mediation) console.log('An Error occured while creating Mediations')
    }

})();
