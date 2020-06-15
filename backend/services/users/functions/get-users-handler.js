'use strict';

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

export const getUsers = async() => {
  try {
    // const users = await User.findAll();
    // return response({ users });
  } catch (error) {
    return response({ error }, 500);
  }
};