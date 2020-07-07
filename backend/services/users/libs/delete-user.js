'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const deleteUser = async (event) => {
  try {
    const email = event.pathParameters.email;
    
    const result = await deleteUserFromCognito({
      Username: email,
      UserPoolId: process.env.COGNITO_USER_POOL_ID
    })

    if(result.isSuccesfully) {
      await deleteUserFromDb(email);
      return response({ email });
    } else {
      const error = result.err;
      return response({ error }, 404);
    }
    
  } catch (error) {
    return response({ error }, 500);
  }
};

const deleteUserFromCognito = (params) => {
  return new Promise(resolve => {
    cognitoServiceProvider.adminDeleteUser(params, function(err, data) {
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

const deleteUserFromDb = async (email) => {
  const { User } = db;
  await User.destroy({
    where: {
      email
    }
});
}