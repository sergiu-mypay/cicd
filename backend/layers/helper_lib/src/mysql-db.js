const Sequelize =  require('sequelize');
require('@fyreware/mysql-data-api');

const sequelize = (host, database, username, password) => {
    return new Sequelize(database, username, password, {
        host: host,
        dialect: 'mysql',
    
        // This tells sequelize to load our module instead of the `mysql2` module
        dialectModulePath: '@fyreware/mysql-data-api'
    });
} 

export {
    sequelize, Sequelize
};