'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const toggleDisableEnable = async (event) => {
  try {
    const email = event.pathParameters.email;
    const body = JSON.parse(event.body);
    const isDisable = body.isDisable;

    let result = null;
    if(isDisable) {
      result = await enableUserInCognito({
        Username: email,
        UserPoolId: process.env.COGNITO_USER_POOL_ID
      })
      return response({ email });
    } else {
      result = await disableUserInCognito({
        Username: email,
        UserPoolId: process.env.COGNITO_USER_POOL_ID
      })
    }
    
    if(result.isSuccesfully) {
      await disableEnableUserInDb(email, isDisable);
      return response({ email });
    } else {
      const error = response.err;
      return response({ error }, 404);
    }
    
  } catch (error) {
    return response({ error }, 500);
  }
};

const enableUserInCognito = (params) => {
  return new Promise(resolve => {
    cognitoServiceProvider.adminEnableUser(params, function(err, data) {
      if(err) {
        resolve({
          isSuccesfully: false,
          err
        });
      } else {
        resolve({
          isSuccesfully: true,
          data
        });
      };
    })
  });
}

const disableUserInCognito = (params) => {
  return new Promise(resolve => {
    cognitoServiceProvider.adminDisableUser(params, function(err, data) {
      if(err) {
        resolve({
          isSuccesfully: false,
          err
        });
      } else {
        resolve({
          isSuccesfully: true,
          data
        });
      };
    })
  });
}

const disableEnableUserInDb = async (email, isDisable) => {
  const { User } = db;
  await User.update({ isDisable: !isDisable }, {
    where: {
      email: email
    }
  });
}