'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const getUser = async (event) => {

    const { User } = db;

    const propeprty = event.pathParameters.property;
    const value = event.pathParameters.value;
    
    try {

        var filterObject = {};
        filterObject[propeprty] = value;

        const users = await User.findAll({
            where: filterObject
        });
        
        if (users.length === 0) {
            return response({error: "User not found"}, 404);
        }

        return response(users, 200);

    } catch (error) {

        return response({error}, 500);
    }
};