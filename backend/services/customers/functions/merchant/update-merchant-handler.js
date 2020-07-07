require('dotenv').config();

var {response} = process.env.IS_OFFLINE ? require('../../../../layers/helper_lib/src') : require('mypay-helpers');
var {connectDB} = process.env.IS_OFFLINE ? require('../../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);


export const updateMerchant = async (event) => {
    const merchantId = event.pathParameters.merchantId;
    const updatedMerchant = JSON.parse(event.body).merchant;

    const merchant = await db.Merchant.findByPk(merchantId);

    if (!merchant) {
        return response({ errorMessage: "Entity not found" }, 404);
    }

    const transaction = await db.sequelize.transaction();

    try {
        await merchant.update({ name: updatedMerchant.name }, { transaction: transaction });
        await transaction.commit();
        return response({});
    } catch (err) {
        await transaction.rollback();
        return response({}, 500);
    }
};