require('dotenv').config();

var {response, getUserId} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const { nanoid } = require('nanoid');

export const createMerchant = async (event) => {
    const userId = getUserId(event);
    const merchant = JSON.parse(event.body).merchant;
    const clientId = event.pathParameters.clientId;
    const businessId = event.pathParameters.businessId;

    const transaction = await db.sequelize.transaction();

    try {

        var merchantEntity = db.Merchant.build({
            clientId: clientId,
            businessId: businessId,
            name: merchant.name,
            id: nanoid()
        });

        await merchantEntity.save({transaction: transaction});

        var userRole = await db.Role.findOne({
            where: {
                name: "Admin"
            }
        });

        var relationship = db.Relationship.build({
            userId: userId,
            merchantId: merchantEntity.id,
            id: nanoid(),
            roleId: userRole.id
        });
        await relationship.save({transaction: transaction});

        await transaction.commit();
        return response({}, 201);
    } catch (err) {
        console.error(err);
        await transaction.rollback();
        return response({}, 500);
    }
};
