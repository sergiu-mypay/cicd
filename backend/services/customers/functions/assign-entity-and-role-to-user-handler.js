'use strict';
require('dotenv').config();
global.fetch = require('node-fetch').default;

//

var {response} = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);
const { Op } = db.Sequelize;

const { nanoid } = require('nanoid');

export const assignEntityAndRoleToUser = async event => {

    const { Relationship } = db;

    try {

        const body = JSON.parse(event.body);
        const { userId, businessId, clientId, merchantId, roleId } = body;

        const relationship = await Relationship.findOne({
            where: {
                userId,
                businessId,
                clientId,
                merchantId
            }
        })

        if (relationship) {
            if(relationship.roleId === roleId) {
                return response({
                    error: "The assignment already exists."
                }, 400);
            }
            await relationship.update({
                roleId
            });
        } else {
            const countRelationshipWithBusiness = await Relationship.count({
                where: {
                    userId,
                    businessId: { [Op.not]: null }
                }
            })

            if(countRelationshipWithBusiness > 0) {
                return response({
                    error: "The user already has an assigned business."
                }, 400);
            }

            const newRelationship = await Relationship.build({
                id: nanoid(),
                userId,
                businessId,
                clientId,
                merchantId,
                roleId
            });
            await newRelationship.save();
        }

        return response({}, 201);
    }
    catch (error) {
        console.log(error);
        await transaction.rollback();
        return response({}, 500);
    }
}
