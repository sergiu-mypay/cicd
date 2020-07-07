export const UserModel= (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    createdBy: DataTypes.STRING,
    typeId: DataTypes.STRING,
    pictureUrl: DataTypes.STRING,
    isDisable: DataTypes.BOOLEAN,
    isDeleted: DataTypes.BOOLEAN,
    refreshToken: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Relationship, { onDelete: 'cascade' });
    User.belongsTo(models.UserType, {foreignKey: 'typeId'});
  };
  return User;
};