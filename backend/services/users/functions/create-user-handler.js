'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const generatePassword = require("password-generator");
const { nanoid } = require('nanoid');
const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const userPoolId = process.env.COGNITO_USER_POOL_ID;

export const createUser = async event => {

  let transaction;
  let transactionRds;
  let body;
  let params;
  let cognitoResponse;

  try {
    const { sequelize, User } = db;

    if (!event.body) {
      const result = response({}, 400);
      return result;
    }

    body = JSON.parse(event.body);
    params = {
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

    var usersCount = await User.count({
      where: {
        email: body.email
      }
    });

    if (usersCount > 0) {
      return response({
        error: "User already exists"
      }, 400);
    }

    transaction = await sequelize.transaction();

    const userId = nanoid();

    const user = User.build({
      email: body.email,
      lastName: body.lastName,
      firstName: body.firstName,
      id: userId
    });

    await user.save({ transaction: transaction });

    cognitoResponse = await createUserInCognito(params);

    const cognitoMyPayRelations = {
      id: nanoid(),
      userId: userId,
      providerId: cognitoResponse.cognitoUserId,
      providerName: 'AWS Cognito'
    }

    const cognitoMyPayRelationsModel = db.IdentityProviderMyPayRelations.build(cognitoMyPayRelations);

    await cognitoMyPayRelationsModel.save({ transaction: transaction });

    await transaction.commit();


    if (process.env.IS_OFFLINE) {

      const dbCognito = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, false);

      let usersCountAws = await dbCognito.User.count({
        where: {
          email: body.email
        }
      });

      if (usersCountAws < 1) {
        transactionRds = await dbCognito.sequelize.transaction();
        const userCognito = dbCognito.User.build(body);
        userCognito.id = userId;
        await userCognito.save({ transaction: transactionRds });

        const cognitoMyPayRelationsModelCognito = dbCognito.IdentityProviderMyPayRelations.build(cognitoMyPayRelations);
        await cognitoMyPayRelationsModelCognito.save({ transaction: transactionRds });
        await transactionRds.commit();
      }
    }

    return response({}, 201);

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    if (transactionRds) {
      await transactionRds.rollback();
    }
    if (cognitoResponse) {
      const paramsDelete = {
        UserPoolId: userPoolId,
        Username: body.email,
      };
      await deleteUserInCognito(paramsDelete);
    }
    return response({}, 500);
  }
};

const createUserInCognito = (params) => {
  return new Promise((resolve, reject) => {
    cognitoServiceProvider.adminCreateUser(params, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve({ cognitoUserId: data.User.Username });
      }
    });
  })
}

const deleteUserInCognito = (params) => {
  return new Promise((resolve, reject) => {
    cognitoServiceProvider.adminDeleteUser(params, (err, data) => {
      if (err) {
        reject(err);
      }
      else {
        resolve({});
      }
    });
  })
}