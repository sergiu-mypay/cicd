var {connectDB} = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(process.env.DB_RESOURCE_ARN, process.env.STAGE + '_database', '', process.env.SECRET_ARN, process.env.IS_OFFLINE);

export const addUserMyPayIdToCognitoToken = async(event)  => {

    const amazonIdentifier = event['userName'];
    const provider = await db.IdentityProviderMyPayRelations.findOne({
        where: {
            providerId: amazonIdentifier
        }
    });

    const myPayUserId = provider.userId;
    event.response = {
        'claimsOverrideDetails': {
            'claimsToAddOrOverride': {
                'myPayUserId': myPayUserId,
            }
        }
    };

    // Return to Amazon Cognito
    return event;
};
