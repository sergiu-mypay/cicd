var response = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/response.helper').response : require('mypay-helpers').response;
var UserModel = process.env.IS_OFFLINE ? require('../../../layers/users_lib/src/user').UserModel : require('users-helpers').UserModel;
var sequelize = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/mysql-db').sequelize : require('mypay-helpers').sequelize;
var Sequelize = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src/mysql-db').Sequelize : require('mypay-helpers').Sequelize;

const database = process.env.STAGE + '_database';
// Arn of Aurora serverless cluster cluster
const host = process.env.DB_RESOURCE_ARN;

// This param is ignored by the wrapper.
const username = '';

// Arn of secrets manager secret containing the rds credentials
const password = process.env.SECRET_ARN;

const User = UserModel(sequelize(host, database, username, password), Sequelize);

export const getUser = async (event) => {

    const propeprty = event.pathParameters.property;
    const value = event.pathParameters.value;
    
    try {

        var filterObject = {};
        filterObject[propeprty] = value;

        const users = await User.findAll({
            where: filterObject
        });
        
        if (users.length === 0) {
            return response({error: "User not found"}, 404);
        }

        return response(users, 200);

    } catch (error) {

        return response({error}, 500);
    }
};