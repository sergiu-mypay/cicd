'use strict';

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

var response = () => { };
var UserModel = () => { };
var sequelize = () => { };
var Sequelize = () => { };

if (process.env.IS_OFFLINE) {
    // response = require('../../../layers/helper_lib/src/response.helper').response;
    // UserModel = require('../../../layers/users_lib/src/user').UserModel;
    // sequelize = require('../../../layers/helper_lib/src/mysql-db').sequelize;
    // Sequelize = require('../../../layers/helper_lib/src/mysql-db').Sequelize;
}
else {
    response = require('mypay-helpers').response;
    UserModel = require('users-helpers').UserModel;
    sequelize = require('mypay-helpers').sequelize;
    Sequelize = require('mypay-helpers').Sequelize;
}

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
    } else {
      result = await disableUserInCognito({
        Username: email,
        UserPoolId: process.env.COGNITO_USER_POOL_ID
      })
    }
    
    if(result.isSuccesfully) {
      // await disableEnableUserInDb(email, isDisable);
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

// const disableEnableUserInDb = async (email, isDisable) => {
//   await User.update({ isDisable: !isDisable }, {
//     where: {
//       email: email
//     }
//   });
// }