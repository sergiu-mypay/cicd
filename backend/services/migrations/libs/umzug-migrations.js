const { sequelize, Sequelize } =  require('../../../layers/helper_lib/dist/nodejs/node_modules/mypay-helpers/mysql-db');
const Umzug = require('umzug');

require('dotenv').config();

const database = process.env.STAGE + '_database';
// Arn of Aurora serverless cluster cluster
const host = process.env.DB_RESOURCE_ARN;

// This param is ignored by the wrapper.
const username = '';

// Arn of secrets manager secret containing the rds credentials
const password = process.env.SECRET_ARN;

const umzug = new Umzug({
    migrations: {
      path: './migrations',
      params: [
        sequelize(host, database, username, password).getQueryInterface(),
        Sequelize
      ]
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize: sequelize(host, database, username, password)
    },
});

module.exports = { umzug };