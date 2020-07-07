export const RelationshipModel = (sequelize, DataTypes) => {
  const Relationship = sequelize.define('Relationship', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.INTEGER,
    businessId: DataTypes.INTEGER,
    clientId: DataTypes.INTEGER,
    merchantId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER
  }, {paranoid: true});
  Relationship.associate = function(models) {
    // associations can be defined here
    Relationship.belongsTo(models.Business);
    Relationship.belongsTo(models.Client);
    Relationship.belongsTo(models.Merchant);
    Relationship.belongsTo(models.User);
    Relationship.belongsTo(models.Role);
  };
  return Relationship;
};