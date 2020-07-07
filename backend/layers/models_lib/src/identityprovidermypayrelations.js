export const IdentityProviderRelationsModel= (sequelize, DataTypes) => {
  const IdentityProviderMyPayRelations = sequelize.define('IdentityProviderMyPayRelations', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.INTEGER,
    providerId: DataTypes.STRING,
    providerName: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {});

  IdentityProviderMyPayRelations.associate = function(models) {
    // associations can be defined here
    IdentityProviderMyPayRelations.belongsTo(models.User);
  };
  return IdentityProviderMyPayRelations;
};