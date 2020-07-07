export const MerchantModel = (sequelize, DataTypes) => {
  const Merchant = sequelize.define(
    'Merchant',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      clientId: DataTypes.STRING,
      businessId: DataTypes.STRING,
    },
    {
      paranoid: true,
      hooks: {
        afterDestroy: async (instance, options) => {
          const relationships = await sequelize.models.Relationship.findAll({
            where: {
              merchantId: instance.id,
            },
          });

          for (const relationship of relationships) {
            await relationship.destroy({ transaction: options.transaction });
          }
        },
      },
    }
  );
  Merchant.associate = function (models) {
    // associations can be defined here
    Merchant.belongsTo(models.Client);
    Merchant.hasMany(models.Relationship, { onDelete: 'cascade' });
  };
  return Merchant;
};
