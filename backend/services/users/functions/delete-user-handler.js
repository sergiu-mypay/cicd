'use strict';

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;
var UserModel = process.env.IS_OFFLINE ? require('../../../layers/users_lib/src/user').UserModel : require('users-helpers').UserModel;
var sequelize = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/mysql-db').sequelize : require('mypay-helpers').sequelize;
var Sequelize = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/mysql-db').Sequelize : require('mypay-helpers').Sequelize;

const database = process.env.STAGE + '_database';
// Arn of Aurora serverless cluster cluster
const host = process.env.DB_RESOURCE_ARN;

// This param is ignored by the wrapper.
const username = '';

// Arn of secrets manager secret containing the rds credentials
const password = process.env.SECRET_ARN;

const User = UserModel(sequelize(host, database, username, password), Sequelize);

export const remove = async (event) => {
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
  await User.destroy({
    where: {
      email
    }
});
}