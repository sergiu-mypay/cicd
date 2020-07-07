'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

var {response, getUserId} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);
const { Op } = db.Sequelize;

const { nanoid } = require('nanoid');

export const createBusiness = async (event) => {
    const { sequelize, Business, Role, Relationship } = db;
    const business = JSON.parse(event.body).business;
    const userId = getUserId(event);

    const transaction = await sequelize.transaction();

    try {

        var businessEntity = Business.build({
            id: nanoid(),
            name: business.name
        });

        await businessEntity.save({transaction: transaction});

        var userRole = await Role.findOne({
            where: {
                name: "Admin"
            }
        });

        const countRelationshipWithBusiness = await Relationship.count({
            where: {
                userId,
                businessId: { [Op.not]: null }
            }
        })

        if(countRelationshipWithBusiness > 0) {
            await transaction.rollback();
            return response({
                error: "The user already has an assigned business."
            }, 400);
        }

        var relationship = Relationship.build({
            id: nanoid(),
            userId: userId,
            businessId: businessEntity.id,
            roleId: userRole.id
        });
        await relationship.save({transaction: transaction});

        await transaction.commit();
        return response({}, 201);
    } catch (err) {

        await transaction.rollback();
        return response(err, 500);
    }
};
