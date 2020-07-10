require('dotenv').config();

var { response } = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const getClient = async (event) => {
    const clientId = event.pathParameters.clientId;

    try {
        const client = await db.Client.findByPk(clientId);

        if (client) {
            return response(client);
        }
        else{
            return response({ errorMessage: "Entity not found" }, 404);
        }
    } catch (err) {
        return response({}, 500);
    }
};