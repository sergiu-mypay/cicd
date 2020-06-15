const SignUpHandler = require('../functions/signup-handler');
const { CognitoUserPool, CognitoUserAttribute } = require('amazon-cognito-identity-js');
const { response } = require('../../../layers/helper_lib/src/response.helper');

test('Request body is undefined', done => {
    const expectedStatusCode = 400;

    SignUpHandler.signUp({}, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(CognitoUserAttribute).toHaveBeenCalledTimes(0);
        done();
    });
});

test('Cognito returns an error', done => {
    const expectedStatusCode = 400;
    const expectedMessage = 'Email already exists';

    var requestBody = {
        'email': 'test123@mail.com',
        'password': '112345142'
    };

    CognitoUserPool.mock.instances[0].signUp = (username, password, attributes, validation, callback) => {
        expect(username).toBe(requestBody.username);
        expect(password).toBe(requestBody.password);

        // cognito failed to sign up user and returned an error message
        callback({ 'message': expectedMessage }, false);
    };

    SignUpHandler.signUp({ body: JSON.stringify(requestBody) }, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(result.body).toBe(response(expectedMessage).body);
        expect(CognitoUserPool).toHaveBeenCalledTimes(1);
        expect(CognitoUserAttribute).toHaveBeenCalledTimes(3);
        done();
    });
});

test('User is signed up succesfully', done => {
    const expectedStatusCode = 201;

    var requestBody = {
        'email': 'test123@mail.com',
        'password': '112345142'
    };

    CognitoUserPool.mock.instances[0].signUp = (username, password, attributes, validation, callback) => {
        expect(username).toBe(requestBody.username);
        expect(password).toBe(requestBody.password);

        // cognito registered succesfully the user
        callback(null, true);
    };

    SignUpHandler.signUp({ body: JSON.stringify(requestBody) }, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(CognitoUserPool).toHaveBeenCalledTimes(1);
        expect(CognitoUserAttribute).toHaveBeenCalledTimes(3);
        done();
    });
});

afterEach(() => {
    CognitoUserAttribute.mockClear();
  });