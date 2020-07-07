export const ClientModel = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    'Client',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      businessId: DataTypes.STRING,
    },
    {
      paranoid: true,
      hooks: {
        afterDestroy: async (instance, options) => {
          const relationships = await sequelize.models.Relationship.findAll({
            where: {
              clientId: instance.id,
            }
          });

          for (const relationship of relationships) {
            await relationship.destroy({ transaction: options.transaction });
          }

          const merchants = await sequelize.models.Merchant.findAll({ where: { clientId: instance.id } });

          for (const merchant of merchants) {
            await merchant.destroy({ transaction: options.transaction });
          }
        },
      },
    }
  );
  Client.associate = function (models) {
    // associations can be defined here
    Client.hasMany(models.Merchant, { onDelete: 'cascade', hooks: true });
    Client.hasMany(models.Relationship, { onDelete: 'cascade' });
    Client.belongsTo(models.Business);
  };
  return Client;
};
