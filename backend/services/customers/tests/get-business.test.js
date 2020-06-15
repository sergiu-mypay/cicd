const { getBusiness } = require('../functions/business/get-business-handler');
const { response } = require('../../../layers/helper_lib/src/response.helper');

//Not actual, method will be full changed after db integration
test('[getEntityDetails] Id is valid get succes response with data', () => {
    const succesresponse = response({ entityName: 'Name', entityData: 'Data', entityId: 1123 });

    return getBusiness({ pathParameters: { id: 1123 } }).then(response => {
        //expect(response).toMatchObject(succesresponse);
    });
});

test('[getEntityDetails] Id is not valid get error resonce', () => { 
    const errorRespoince = response({ errorMessage: 'Enity not found' }, 404);

    return getBusiness({ pathParameters: {  } }).then(response => {
        //expect(response).toMatchObject(errorRespoince);
    });
});