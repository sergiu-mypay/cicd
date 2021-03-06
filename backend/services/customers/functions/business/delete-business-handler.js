const axios = require('axios').default;

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;

export const deleteBusiness = async(event) => {
    const businessId = event.pathParameters.id;
    if(!businessId) {
        return response({ errorMessage: 'Enity not found' }, 404);
    }

    try {
        const result = await axios.delete(`https://my-pay-eae27.firebaseio.com/business/${businessId}.json`);
        return response(result.data);
    } catch(err) {
        return response(err, 404);
    }
};