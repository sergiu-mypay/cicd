'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;
var nanoid = require('nanoid').nanoid;

const {CognitoUserPool, CognitoUserAttribute} = require('amazon-cognito-identity-js');
var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};
const userPool = new CognitoUserPool(poolData);

export const signUp = async event => {
    const { User, sequelize } = db;

    if (!event.body) {
        const result = response({}, 400);
        return result;
    }

    const transaction = await sequelize.transaction();

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

        body.isDisable = false;
       
        const user = User.build(body);
        user.id = nanoid();

        await user.save({transaction: transaction});

        const cognitoresponse = await signUpUserInCognito(body);

        const cognitoMyPayRelations = {
            id: nanoid(),
            userId: user.id,
            providerId: cognitoresponse.cignitoUserId,
            providerName: 'AWS Cognito'
         }

        const cognitoMyPayRelationsModel = db.IdentityProviderMyPayRelations.build(cognitoMyPayRelations);

        await cognitoMyPayRelationsModel.save({transaction: transaction});

        if (cognitoresponse.statusCode !== 201) {
            await transaction.rollback();
            return response(cognitoresponse, cognitoresponse.statusCode);
        }
        else {
            await transaction.commit();
            ///TODO: This code needed for creation user in both plase local db and cognitodb:
            ///problem is in login PreTokenGeneration method.
            ///When we create user local we don't have this user in AWS db
            ///PreTokenGeneration method will run only on aws and it will initiate query
            /// in AWS database, which don't have user that we created localy and it will throw error 
            let transactionRds;
            if(process.env.IS_OFFLINE) {
                const dbCognito = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, false);

                transactionRds = await dbCognito.sequelize.transaction();
                const userCognito = dbCognito.User.build(body);
                userCognito.id = user.id;
                await userCognito.save({transaction: transactionRds});
                
                const cognitoMyPayRelationsModelCognito = dbCognito.IdentityProviderMyPayRelations.build(cognitoMyPayRelations);
                await cognitoMyPayRelationsModelCognito.save({transaction: transactionRds});
                await transactionRds.commit();
            }
            return response({});
        }
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        await transactionRds.rollback();
        const result = response('Internal server error', 500);
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
                console.error("User Pool SignUp:", err);
                const errorresponse = {error: "Internal server error", statusCode: 400};
                resolve(errorresponse);
            }
            else {
                const successresponse = { cignitoUserId: result.userSub, statusCode: 201};
                resolve(successresponse);
            }
        });
    });
}