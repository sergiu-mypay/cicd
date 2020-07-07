export const UserTypeModel = (sequelize, DataTypes) => {
    const UserType = sequelize.define('UserType', {
      id: {
        type: DataTypes.STRING,
        primaryKey:true
      },
      name: DataTypes.STRING
    }, {});
    UserType.associate = function(models) {
      // associations can be defined here
    };
    return UserType;
  };