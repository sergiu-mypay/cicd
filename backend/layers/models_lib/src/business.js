export const BusinessModel = (sequelize, DataTypes) => {
  const Business = sequelize.define(
    'Business',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      paranoid: true,
      hooks: {
        afterDestroy: async (instance, options) => {
          const clients = await sequelize.models.Client.findAll({ where: { businessId: instance.id } });

          for (const client of clients) {
           await client.destroy({ transaction: options.transaction });
          }

          const relationships = await sequelize.models.Relationship.findAll({
            where: {
              businessId: instance.id,
            },
          });

          for (const relationship of relationships) {
           await relationship.destroy({ transaction: options.transaction });
          }
        },
      },
    }
  );
  Business.associate = function (models) {
    // associations can be defined here
    Business.hasMany(models.Client, { onDelete: 'cascade', hooks: true });
    Business.hasMany(models.Relationship, { onDelete: 'cascade' });
  };
  return Business;
};
