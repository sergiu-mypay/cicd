'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const updateBusiness = async(event) => {
    const { Business } = db;
    const businessId = event.pathParameters.businessId;
    const updatedBusiness = JSON.parse(event.body).business;

    try {
        
        const business = await Business.findByPk(businessId);

        if(business)
        {
            await business.update({
                name: updatedBusiness.name
            });
        }
        else{
            return response({errorMessage: "Entity not found"}, 404);
        }

        return response({});
    } catch(err) {

        return response(err, 500);
    }
};