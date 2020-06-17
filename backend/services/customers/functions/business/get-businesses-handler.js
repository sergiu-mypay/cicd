const axios = require('axios').default;

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;

export const getBusinesses = async() => {
  try {
    //This code for storing some data in NOSql store for my task, while we not created DB.
    const result = await axios.get('https://my-pay-eae27.firebaseio.com/business.json');
    const propNames = Object.getOwnPropertyNames(result.data);
    const businessEntities = propNames.map((name) => ({
        id: name,
        type: result.data[name].type,
        name: result.data[name].name,
        clients: result.data[name].clients,
    }));
    return response(businessEntities);
  } catch (err) {
    console.log(err);
    return response(err, 404);
  }
};
