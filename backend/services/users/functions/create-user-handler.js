'use strict';

var generatePassword = require("password-generator");
const AWS = require('aws-sdk');

const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const userPoolId = process.env.COGNITO_USER_POOL_ID;

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

export const createUser = async event => {

  if (!event.body) {
    const result = response({}, 400);
    return result;
  }

  const body = JSON.parse(event.body);

  const params = {
    UserPoolId: userPoolId,
    Username: body.email,
    DesiredDeliveryMediums: [
      'EMAIL'
    ],
    ForceAliasCreation: false,
    TemporaryPassword: generatePassword(12, false),
    UserAttributes: [
      {
        Name: 'email',
        Value: body.email
      },
      {
        Name: 'custom:permissions',
        Value: 'ADD_USER,UPDATE_USER,DELETE_USER,VIEW_ALL'
      },
      {
        Name: 'custom:roles',
        Value: 'ROLE_ADMIN,ROLE_MANAGER'
      }
    ]
  };

  try {

    var usersCount = await User.count({
      where: {
        email: body.email
      }
    });
    
    if(usersCount > 0)
    {
      return response({
        error: "User already exists"
      }, 400);
    }

    const user = User.build({
      email: body.email,
      lastName: body.lastName,
      firstName: body.firstName
    });

    await user.save();

    var cognitoResponse = await CreateUserInCognito(params);

    if(cognitoResponse.statusCode !== 201)
    {
      await user.destroy();
    }

    return cognitoResponse;

  } catch (error) {
    const result = response({error: error}, 500);
    return result;
  }
};

const CreateUserInCognito = (params) => {
  return new Promise(resolve => {
    cognitoServiceProvider.adminCreateUser(params, (err, data) => {

      if (err) {
        const errorResponse = response({error: err.message}, 400);
        resolve(errorResponse);
      }
      else {

        const successResponse = response({}, 201);

        resolve(successResponse);
      }
    });
  })
}