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

export const getUser = async (event) => {

    const propeprty = event.pathParameters.property;
    const value = event.pathParameters.value;
    
    try {

        var filterObject = {};
        filterObject[propeprty] = value;

        // const users = await User.findAll({
        //     where: filterObject
        // });
        
        // if (users.length === 0) {
        //     return response({error: "User not found"}, 404);
        // }

        // return response(users, 200);

    } catch (error) {

        return response({error}, 500);
    }
};