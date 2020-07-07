'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');
var { response } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);


export const completeInvite = async event => {
    let transaction;
    let transactionRds;
    let changePasswordCognitoResult;
    let authenticationDetails;
    let body;
    try {
        if (!event.body) {
            return response({}, 400);
        }
        body = JSON.parse(event.body);

        authenticationDetails = new AuthenticationDetails({
            Username: body.username,
            Password: body.oldPassword,
        });

        const userData = {
            Username: body.username,
            Pool: userPool
        };

        const oldUser = await db.User.findOne({
            where: {
                email: body.email
            }
        });

        if (!oldUser) {
            return response({}, 404);
        }

        transaction = await db.sequelize.transaction();

        //Update user
        await oldUser.update({
            firstName: body.firstName,
            lastName: body.lastName,
        }, { transaction: transaction });

        changePasswordCognitoResult = await changePassword(userData, authenticationDetails, body.oldPassword, body.password);

        await transaction.commit();

        if (process.env.IS_OFFLINE) {
            const dbCognito = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, false);

            const oldUserRds = await dbCognito.User.findOne({
                where: {
                    email: body.email
                }
            });

            if (oldUserRds) {
                transactionRds = await dbCognito.sequelize.transaction();
                //Update user
                await oldUserRds.update({
                    firstName: body.firstName,
                    lastName: body.lastName,
                }, { transaction: transactionRds });

                await transactionRds.commit();
            }
        }

        return changePasswordCognitoResult;
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        if (transactionRds) {
            await transactionRds.rollback();
        }
        if (changePasswordCognitoResult && changePasswordCognitoResult.statusCode === 200) {
            authenticationDetails = new AuthenticationDetails({
                Username: body.username,
                Password: body.password,
            });
            await changePassword(userData, authenticationDetails, body.password, body.oldPassword);
        }
        return response({}, 500);
    }
};


const changePassword = (userData, authenticationDetails, oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {

        const cognitoUser = new CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () => {
                cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else if (result) {
                        resolve(response({}));
                    }
                });
            },
            newPasswordRequired: (userAttributes) => {
                cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
                    onSuccess: () => {
                        resolve(response({}));
                    },
                    onFailure: (err) => {
                        reject(err);
                    }
                });
            },
            onFailure: function (err) {
                reject(err);
            },
        });
    });
};
