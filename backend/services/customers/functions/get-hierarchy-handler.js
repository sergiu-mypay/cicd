'use strict';

var { response, getUserId } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);
const { Op } = db.Sequelize;

export const getHierarchy = async (event) => {
  const userId = getUserId(event);

  try {

    const clientsList = [];
    const merchantsList = [];

    const businesses = await db.Relationship.findAll({
      where: { businessId: { [Op.not]: null }, userId: userId },
      include: [
        {
          model: db.Business,
          attributes: ["id", "name", "description"],
          include: [
            {
              model: db.Client,
              attributes: ["id", "name", "description", "businessId"],
              include: { model: db.Merchant, attributes: ["id", "name", "description", "businessId", "clientId"] }
            },
          ],
        },
        {
          model: db.Role,
          attributes: ["name"]
        }
      ],
      order: [
        [db.Business, "createdAt", "asc"],
        [db.Business, db.Client, "createdAt", "asc"],
        [db.Business, db.Client, db.Merchant, "createdAt", "asc"]
      ]
    }).map(b => {
      let businessObject = b.Business.get({ plain: true });
      businessObject.role = b.Role.name;
      return businessObject;
    });

    businesses.forEach(b => {
      b.Clients.forEach(c => {
        clientsList.push(c.id);
        c.role = b.role;

        c.Merchants.forEach(m => {
          merchantsList.push(m.id);
          m.role = b.role;
        })
      })
    });

    const clients = await db.Relationship.findAll({
      where: { clientId: { [Op.not]: null }, userId: userId },
      include: [
        {
          model: db.Client,
          attributes: ["id", "name", "description", "businessId"],
          include: [
            {
              model: db.Merchant,
              attributes: ["id", "name", "description", "businessId", "clientId"]
            }
          ]
        },
        {
          model: db.Role,
          attributes: ["name"]
        }
      ],
      order: [
        [db.Client, "createdAt", "asc"],
        [db.Client, db.Merchant, "createdAt", "asc"]
      ]
    }).filter(f => !clientsList.includes(f.Client.id))
      .map(c => {
        let clientObject = c.Client.get({ plain: true });
        clientObject.role = c.Role.name;
        return clientObject;
    });

    clients.forEach(c => {

      c.Merchants.forEach(m => {
        merchantsList.push(m.id);
        m.role = c.role;
      })
    });

    const merchants = await db.Relationship.findAll({
      where: { merchantId: { [Op.not]: null }, userId: userId },
      include: [
        {
          model: db.Merchant,
          attributes: ["id", "name", "description", "businessId", "clientId"]
        },
        {
          model: db.Role,
          attributes: ["name"]
        }
      ],
      order: [
        [db.Merchant, "createdAt", "asc"]
      ]
    }).filter(f => !merchantsList.includes(f.Merchant.id))
      .map(m => {
        let merchantObject = m.Merchant.get({ plain: true });
        merchantObject.role = m.Role.name;
        return merchantObject;
    });

    return response({
      Businesses: businesses,
      Clients: clients,
      Merchants: merchants
    });

  } catch (err) {
    console.error(err); //loging
    return response('Server Error', 500);
  }
};
