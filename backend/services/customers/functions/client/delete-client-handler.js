require('dotenv').config();

var {response} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);


export const deleteClient = async (event) => {
    const clientId = event.pathParameters.clientId;

    if (!clientId) {
        return response({ errorMessage: 'Invalid request' }, 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
        const client = await db.Client.findByPk(clientId);

        if (!client) {
            return response({ errorMessage: 'Entity not found' });
        }

        await client.destroy({transaction: transaction});
        await transaction.commit();
        return response({});

    } catch (err) {
        await transaction.rollback();
        return response({}, 500);
    }
};