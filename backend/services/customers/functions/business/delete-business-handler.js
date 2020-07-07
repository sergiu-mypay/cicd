'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const deleteBusiness = async (event) => {
    const { sequelize, Business } = db;
    const businessId = event.pathParameters.businessId;

    if (!businessId) {
        return response({ errorMessage: 'Invalid request' }, 400);
    }

    var transaction = await sequelize.transaction();

    try {

        var business = await Business.findByPk(businessId);
        if (business) {
            await business.destroy({transaction: transaction});
            await transaction.commit();
            return response({}, 200);
        }
        else {
            return response({ errorMessage: 'Entity not found' }, 404);
        }
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        return response('Internal server error', 500);
    }
};