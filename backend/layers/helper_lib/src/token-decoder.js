var jwt = require('jsonwebtoken');
const { PEM_KEY } = require('./constants');

////
//


function getUserId(event) {
    const token = event.headers['Authorization'].replace(/['"]+/g, '');
    var result = jwt.decode(token, PEM_KEY, { algorithms: ['RS256'] });
    return result['myPayUserId'];
}

export { getUserId };
