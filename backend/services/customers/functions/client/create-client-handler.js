require('dotenv').config();

var {response, getUserId} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

const { nanoid } = require('nanoid');

export const createClient = async (event) => {
    const client = JSON.parse(event.body).client;
    const businessId = event.pathParameters.businessId;
    const userId = getUserId(event);

    const transaction = await db.sequelize.transaction();

    try {

        var clientEntity = db.Client.build({
            businessId: businessId,
            name: client.name,
            id: nanoid()
        });

        await clientEntity.save({transaction: transaction});

        var userRole = await db.Role.findOne({
            where: {
                name: "Admin"
            }
        });

        var relationship = db.Relationship.build({
            userId: userId,
            clientId: clientEntity.id,
            id: nanoid(),
            roleId: userRole.id
        });
        await relationship.save({transaction: transaction});

        await transaction.commit();
        return response({}, 201);
    } catch (err) {
        await transaction.rollback();
        return response({}, 500);
    }
};
