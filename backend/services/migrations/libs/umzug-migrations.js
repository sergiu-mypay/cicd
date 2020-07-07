require('dotenv').config();

var connectDB = require('../../../layers/models_lib/dist/nodejs/node_modules/models/db').connectDB;
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, false);

const Umzug = require('umzug');

const umzug = new Umzug({
    migrations: {
      path: './migrations',
      params: [
        db.sequelize.getQueryInterface(),
        db.Sequelize
      ]
    },
    storage: 'sequelize',
    storageOptions: {
      sequelize: db.sequelize
    },
});
 
module.exports = { umzug };