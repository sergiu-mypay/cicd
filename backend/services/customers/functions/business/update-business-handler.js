const axios = require('axios').default;

var response = () => {}

if (process.env.IS_OFFLINE) {
    response = require('../../../../layers/helper_lib/src/response.helper').response;
}
else {
    response = require('mypay-helpers').response;
}

export const updateBusiness = async(event) => {
    const businessId = event.pathParameters.id;
    const updatetBusiness = JSON.parse(event.body).business;
    try {
        const result = await axios.put(`https://my-pay-eae27.firebaseio.com/business/${businessId}.json`, updatetBusiness);
        return response(result.data);
    } catch(err) {
        return response(err, 404);
    }
};