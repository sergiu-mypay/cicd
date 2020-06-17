'use strict';
require('dotenv').config();
const {CognitoUserPool, CognitoUser, AuthenticationDetails} = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch').default;

var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export const login = async event => {

    try {

        if (!event.body) {
            const result = response({}, 400);
            return result;
        }
        let body = JSON.parse(event.body);

        const authenticationDetails = new AuthenticationDetails({
            Username: body.username,
            Password: body.password,
        });

        const userData = {
            Username: body.username,
            Pool: userPool
        };

        const result = authenticateUser(userData, authenticationDetails);

        return result;
    }
    catch (error) {
        const result = response({ error: error }, 500);
        return result;
    }
};

const authenticateUser = (userData, authenticationDetails) => {
    return new Promise(resolve => {

        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const successResponse = response(result.getIdToken().getJwtToken() , 201);
                resolve(successResponse);
            },
            onFailure: function (err) {
                const failureResponse = response(err , 400);
                resolve(failureResponse);
            },
            newPasswordRequired: () => {
                const newPasswordResponse = response({ error: "Password must be changed" }, 400);
                resolve(newPasswordResponse);
            }
        });
    });
};