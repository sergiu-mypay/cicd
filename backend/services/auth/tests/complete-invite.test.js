jest.mock('dotenv');
jest.mock('node-fetch');
jest.mock('amazon-cognito-identity-js');

jest.mock('../../../layers/models_lib/src', () => {
    return {
        connectDB: jest.fn(() => {
            return {
                User: {
                    findOne: jest.fn(() => {
                        return null;
                    })
                },
                sequelize: {
                    transaction: jest.fn(() => {
                        return {
                            commit: jest.fn(() => {
                                return {
                                    result: 'succes'
                                }
                            }),
                            rollback: jest.fn(() => {
                                return {
                                    result: 'error transaction rollback'
                                }
                            })
                        }
                    })
                }
            }
        })
    }
});

var { connectDB } = require('../../../layers/models_lib/src');

const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);



var { completeInvite } = require('../functions/complete-invite-signup-handler');


require('dotenv').config();
global.fetch = require('node-fetch').default;

const { CognitoUserPool, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID
};



const userPool = new CognitoUserPool(poolData);

test('Invalid body', async () => {
    const expectedStatusCode = 400;

    const result = await completeInvite({});

    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
});


test('User not registered', async () => {
    const body = {
        username: 'email@email.com',
        email: 'email@email.com',
        lastName: 'lastname1',
        firstName: 'firstname1',
        password: 'password1',
        oldPassword: 'oldPassword1',
    }


    const expectedStatusCode = 404;

    const result = await completeInvite({ body: JSON.stringify(body) });

    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('headers');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin');
});


