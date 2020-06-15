'use strict';

require('dotenv').config();
import {CognitoUserPool, CognitoUser, AuthenticationDetails} from 'amazon-cognito-identity-js';
global.fetch = require('node-fetch').default;

var response = () => {}

if (process.env.IS_OFFLINE) {
    response = require('../../../layers/helper_lib/src/response.helper').response;
}
else {
    response = require('mypay-helpers').response;
}

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

export const changePassword = (event, context, callback) => {
    if (!event.body){
        const response = response({}, 400);
        return callback(null, response); 
    }
    const body = JSON.parse(event.body);

    const userData = {
        Username: body.username,
        Pool: userPool
    };

    const authenticationDetails = new AuthenticationDetails({
        Username: body.username,
        Password: body.password,
    });

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: () => {
            cognitoUser.changePassword(body.password, body.newPassword, (err, result) => {
                if(err)
                {
                    const response = response({error: err.message}, 400);
                    callback(null, response);
                }
                else{
                    const response = response({}, 200);
                    callback(null, response);
                }
            });
        },
        newPasswordRequired: (userAttributes) => {

            cognitoUser.completeNewPasswordChallenge(body.newPassword, userAttributes, {
                onSuccess: () => {
                    const successResponse = response({}, 200);
                    callback(null, successResponse);
                },
                onFailure: (error) => {
                    const errorResponse = response({error: error.message}, 400);
                    callback(null, errorResponse);
                }
            });
        },
        onFailure: function(err) {
            const falureResponse = response({error: err.message}, 400);
            callback(null, falureResponse); 
        },
    });
}