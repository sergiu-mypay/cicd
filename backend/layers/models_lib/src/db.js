'use strict';

import models from './index';
const Sequelize = require('sequelize');
import * as localConfig from './local-configuration';

const sequelize = (host, database, username, password, offline) => {
  if (offline) {
    return new Sequelize(localConfig.DATABASE_NAME, localConfig.USER_NAME, localConfig.DATABASE_PASSWORD, {
      dialect: 'mysql',
      host: 'localhost',
    });
  }
  else {
    return new Sequelize(database, username, password, {
      host: host,
      dialect: 'mysql',

      // This tells sequelize to load our module instead of the `mysql2` module
      dialectModule: require('@fyreware/mysql-data-api')
    });
  }
}

export const connectDB = (host, database, username, password, offline) => {
  let db = {};
  db.sequelize = sequelize(host, database, username, password, offline);
  db.Sequelize = Sequelize;
  
  models.forEach((model) => {
    const dbModel = model(db.sequelize, Sequelize.DataTypes);
    db[dbModel.name] = dbModel;
  });
  
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  return db;
}
