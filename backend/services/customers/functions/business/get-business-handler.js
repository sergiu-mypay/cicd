const axios = require('axios').default;

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;

export const getBusiness = async(event) => {
  const businessId = event.pathParameters.id;
  try {
    const result = await axios.get(`https://my-pay-eae27.firebaseio.com/business/${businessId}.json`);
    const businessEntity = ({ ...result.data, id: businessId });
    return response(businessEntity);
  } catch (err) {
    return response(err, 404);
  }
};
