const LogInHandler = require('../functions/login-handler');
const { CognitoUser, AuthenticationDetails } =  require('amazon-cognito-identity-js');

test('Request body is not valid', done => {
    const expectedStatusCode = 400;

    LogInHandler.login({}, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(CognitoUser).toHaveBeenCalledTimes(0);
        expect(AuthenticationDetails).toHaveBeenCalledTimes(0);
        done();
    });
});

test('Cognito returns an error', done => {
    const expectedStatusCode = 400;
    const expectedMessage = 'Username is not valid';

    const requestBody = {
        'username': '',
        'password': ''
    };

    LogInHandler.login({ 'body': JSON.stringify(requestBody) }, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(CognitoUser).toHaveBeenCalledTimes(1);
        expect(AuthenticationDetails).toHaveBeenCalledTimes(1);
        expect(JSON.parse(result.body).message).toBe(expectedMessage);
        done();
    });
});

test('User is autheticated succesfully', done => {
    const expectedStatusCode = 200;
    const expectedToken = 'test-token';

    const requestBody = {
        'username': 'test@mail.com',
        'password': '132423432'
    };

    LogInHandler.login({ 'body': JSON.stringify(requestBody) }, null, (param, result) => {
        expect(result.statusCode).toBe(expectedStatusCode);
        expect(CognitoUser).toHaveBeenCalledTimes(1);
        expect(AuthenticationDetails).toHaveBeenCalledTimes(1);
        expect(JSON.parse(result.body).token).toBe(expectedToken);
        done();
    });
});

afterEach(() => {
    CognitoUser.mockClear();
    AuthenticationDetails.mockClear();
  });

