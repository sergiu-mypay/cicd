'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const existsRelationship = async event => {

    const { Relationship } = db;

    if (!event.body) {
      const result = response({}, 400);
      return result;
    }

    try {

        const body = JSON.parse(event.body);
        const { userId, businessId, clientId, merchantId } = body.data;

        const relationship = await Relationship.findOne({
            where: {
                userId,
                businessId,
                clientId,
                merchantId
            }
        })

        if (relationship) {
            return response({roleId: relationship.roleId}, 201);
        }

        return response({}, 400);
    }
    catch (error) {
        console.log(error);
        await transaction.rollback();
        return response(error, 500);
    }
} 