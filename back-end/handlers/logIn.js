import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { apiResponse, HTTPError } from '../utils/apiResponse';
import { authFlows, challengeNames } from '../utils/cognito';
import { commonMiddlewareWithValidator } from '../utils/middleware';

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
        username: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        newPassword: {
          type: 'string',
        },
      },
      required: ['username', 'password'],
    },
  },
  required: ['body'],
};
const validationOptions = { inputSchema: schema };

export const handler = commonMiddlewareWithValidator(logIn, validationOptions);

async function logIn(event) {
  try {
    const { body } = event;

    const authRes = await cognito
      .adminInitiateAuth(createInitAuthParams(body))
      .promise();

    if (
      body.newPassword &&
      authRes?.ChallengeName === challengeNames.NEW_PASSWORD_REQUIRED
    ) {
      const newPasswordRes = await setNewPassword({
        ...authRes,
        ...body,
      });

      return apiResponse({
        cors: true,
        body: {
          authenticationResult: newPasswordRes?.AuthenticationResult ?? {},
        },
      });
    }

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

function createInitAuthParams(data) {
  return {
    AuthFlow: authFlows.ADMIN_USER_PASSWORD_AUTH,
    UserPoolId: COGNITO_GENERIC_USER_POOL_ID,
    ClientId: COGNITO_GENERIC_USER_CLIENT_ID,
    AuthParameters: {
      USERNAME: data?.username,
      PASSWORD: data?.password,
    },
  };
}

function setNewPassword(args) {
  const { ChallengeName, Session, newPassword, username } = args;
  return cognito
    .respondToAuthChallenge({
      ChallengeName,
      Session,
      ClientId: COGNITO_GENERIC_USER_CLIENT_ID,
      ChallengeResponses: {
        NEW_PASSWORD: newPassword,
        USERNAME: username,
      },
    })
    .promise();
}
