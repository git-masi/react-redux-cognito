import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { commonMiddlewareWithValidator } from '../utils/middleware';
import { apiResponse, HTTPError } from '../utils/apiResponse';
import { authFlows } from '../utils/cognito';

const { COGNITO_GENERIC_USER_POOL_ID, COGNITO_GENERIC_USER_CLIENT_ID } =
  process.env;
const cognito = new CognitoIdentityServiceProvider({
  apiVersion: '2016-04-19',
});
const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
        },
      },
      required: ['refreshToken'],
    },
  },
  required: ['body'],
};
const validationOptions = {
  inputSchema: schema,
};

export const handler = commonMiddlewareWithValidator(
  refreshAuthTokens,
  validationOptions
);

async function refreshAuthTokens(event) {
  try {
    const {
      body: { refreshToken },
    } = event;

    const authRes = await cognito
      .adminInitiateAuth({
        AuthFlow: authFlows.REFRESH_TOKEN_AUTH,
        UserPoolId: COGNITO_GENERIC_USER_POOL_ID,
        ClientId: COGNITO_GENERIC_USER_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      })
      .promise();

    return apiResponse({
      cors: true,
      body: {
        authenticationResult: authRes?.AuthenticationResult ?? {},
        accountStatus: authRes?.ChallengeName ?? '',
      },
    });
  } catch (error) {
    console.log(error);

    if (error instanceof HTTPError)
      return apiResponse({ ...error, cors: true });

    return apiResponse({
      statusCode: 500,
      cors: true,
    });
  }
}
