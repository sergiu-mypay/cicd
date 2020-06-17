const axios = require('axios').default;

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;

export const createBusiness = async(event) => {
    const business = JSON.parse(event.body).business;
    business.type = 'b';
    
    try {
        const result = await axios.post('https://my-pay-eae27.firebaseio.com/business.json', business);    
        return response(result.data);
    } catch(err) { 
        return response(err, 404);
    }
};