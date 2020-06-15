'use strict';

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

var response = () => { };
var UserModel = () => { };
var sequelize = () => { };
var Sequelize = () => { };

if (process.env.IS_OFFLINE) {
    response = require('../../../layers/helper_lib/src/response.helper').response;
    UserModel = require('../../../layers/users_lib/src/user').UserModel;
    sequelize = require('../../../layers/helper_lib/src/mysql-db').sequelize;
    Sequelize = require('../../../layers/helper_lib/src/mysql-db').Sequelize;
}
else {
    response = require('mypay-helpers').response;
    UserModel = require('users-helpers').UserModel;
    sequelize = require('mypay-helpers').sequelize;
    Sequelize = require('mypay-helpers').Sequelize;
}

export const remove = async (event) => {
  try {
    const email = event.pathParameters.email;
    
    const result = await deleteUserFromCognito({
      Username: email,
      UserPoolId: process.env.COGNITO_USER_POOL_ID
    })

    if(result.isSuccesfully) {
      // await deleteUserFromDb(email);
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

// const deleteUserFromDb = async (email) => {
//   await User.destroy({
//     where: {
//       email
//     }
// });
// }