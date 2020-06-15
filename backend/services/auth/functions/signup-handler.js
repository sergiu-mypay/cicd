'use strict';
require('dotenv').config();

import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';

global.fetch = require('node-fetch').default;


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


const database = process.env.STAGE + '_database';
// Arn of Aurora serverless cluster cluster
const host = process.env.DB_RESOURCE_ARN;

// This param is ignored by the wrapper.
const username = '';

// Arn of secrets manager secret containing the rds credentials
const password = process.env.SECRET_ARN;

const User = UserModel(sequelize(host, database, username, password), Sequelize);

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);

export const signUp = async event => {
    if (!event.body) {
        const result = response({}, 400);
        return result;
    }

    let body = JSON.parse(event.body);

    try {

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

        const user = User.build(body);

        await user.save();

        const cognitoresponse = await signUpUserInCognito(body);

        if (cognitoresponse.statusCode !== 201) {
            user.destroy();
        }

        return cognitoresponse;
    }
    catch (error) {
        const result = response(error, 500);
        return result;
    }
};

const signUpUserInCognito = (body) => {
    return new Promise(resolve => {

        let attributeList = [];
        attributeList.push(new CognitoUserAttribute({ Name: 'email', Value: body.email }));
        attributeList.push(
            new CognitoUserAttribute({ Name: 'custom:roles', Value: 'ROLE_ADMIN,ROLE_MANAGER' })
        );
        attributeList.push(
            new CognitoUserAttribute({
                Name: 'custom:permissions',
                Value: 'ADD_USER,UPDATE_USER,DELETE_USER,VIEW_ALL'
            }));

        userPool.signUp(body.username, body.password, attributeList, null, (err, result) => {
            if (err) {
                const successresponse = response(err.message, 400);
                resolve(successresponse);
            }
            else {

                const errorresponse = response({}, 201);
                resolve(errorresponse);
            }
        });
    });
}