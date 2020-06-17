'use strict';

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

export const getUsers = async() => {
  try {
    const users = await User.findAll();
    return response({ users });
  } catch (error) {
    console.log('error', error);
    return response({ error }, 500);
  }
};