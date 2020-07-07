'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const signUpFunction = require('../libs/signup');
const deleteUserFunction = require('../../users/libs/delete-user');
const generatePassword = require('password-generator');

const AWS = require('aws-sdk');
const cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const authWithSocialMedia = async event => {
    try {

        const { User } = db;

        if (!event.body) {
            const result = response({}, 400);
            return result;
        }
        const body = JSON.parse(event.body);
        const { email, id, identityProvider } = body;

        const user = await getUser(email);

        var shouldAddIdentity = false;
        var newUser = false;
        if(user.data) {
            const identities = user.data.UserAttributes.filter(pair => pair.Name === 'identities')[0];
            if (identities) {
                const identitiesJson = JSON.parse(identities.Value);
                const count = identitiesJson.filter(identity => identity.providerName === identityProvider && identity.userId === id);
                if(count.length === 0) {
                    shouldAddIdentity = true;
                }
            } else {
                shouldAddIdentity = true;
            }
        } 
        else {
            body.userDetails.password = generatePassword(12, false);
            event.body = JSON.stringify(body.userDetails);
            const responseSignUp = await signUpFunction.signUp(event);

            if(responseSignUp.statusCode === 201) {
                shouldAddIdentity = true;
                newUser = true;
            } else {
                return responseSignUp;
            }
        }
        
        if(shouldAddIdentity) {
            const destinationUser = {
                ProviderAttributeName: "",
                ProviderAttributeValue: email,
                ProviderName: "Cognito"
            };
    
            const sourceUser = {
                ProviderAttributeName: "Cognito_Subject",
                ProviderAttributeValue: id,
                ProviderName: identityProvider
            }
    
            const responseLinkProvider = await authenticateUserWithSocialMedia(destinationUser, sourceUser);

            if(!responseLinkProvider.isSuccesfully) {
                if(newUser) {
                    event.pathParameters = {
                        email
                    };
                    await deleteUserFunction.deleteUser(event);
                }
                return response({}, 404);
            }
        } 

        const { firstName, lastName, pictureUrl } = body.userDetails;

        await User.update({ 
            firstName,
            lastName,
            pictureUrl
        }, {
            where: {
                email
            }
        });

        const usersDb = await User.findAll({
            where: {
                email
            }
        });

        const userDb = usersDb[0];

        return response({ user: userDb });

    }
    catch (error) {
        const result = response(error, 500);
        return result;
    }
};

const authenticateUserWithSocialMedia = (destinationUser, sourceUser) => {
    return new Promise(resolve => {
        cognitoServiceProvider.adminLinkProviderForUser({
            DestinationUser: destinationUser,
            SourceUser: sourceUser,
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        }, function(err, data) {
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
};

const getUser = (username) => {
    return new Promise(resolve => {
        cognitoServiceProvider.adminGetUser({
            Username: username,
            UserPoolId: process.env.COGNITO_USER_POOL_ID
        }, function(err, data) {
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
};