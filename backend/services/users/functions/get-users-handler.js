'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const getUsers = async() => {
  try {
    const { User, Relationship, Business, Client, Merchant, Role } = db;
    const users = await User.findAll({
      include: [
        {
          model: Relationship,
          include: [
            {
              model: Business,
              attributes: ["id", "name"]
            },
            {
              model: Client,
              attributes: ["id", "name"]
            },
            {
              model: Merchant,
              attributes: ["id", "name"]
            },
            {
              model: Role,
              attributes: ["id", "name"]
            }
          ]
        }
      ]
    });
    return response({ users });
  } catch (error) {
    
    return response({ error }, 500);
  }
};