import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { apiResponse, HTTPError } from '../utils/apiResponse';
import { commonMiddlewareWithValidator } from '../utils/middleware';
import { emailPattern } from '../utils/regex';

const { COGNITO_GENERIC_USER_POOL_ID } = process.env;
const cognito = new CognitoIdentityServiceProvider({
  apiVersion: '2016-04-19',
});
const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          pattern: emailPattern,
        },
      },
      required: ['email'],
    },
  },
  required: ['body'],
};
const validationOptions = {
  inputSchema: schema,
};

export const handler = commonMiddlewareWithValidator(signUp, validationOptions);

async function signUp(event) {
  try {
    const { body } = event;
    const { email } = body;

    // could do this with PreSignUp_AdminCreateUser
    if (await emailIsTaken(email)) throw HTTPError.BadRequest('Email is taken');

    const createUserRes = await cognito
      .adminCreateUser(createCognitoUserParams({ ...body }))
      .promise();

    console.log(createUserRes);

    return apiResponse({
      cors: true,
      body: {
        accountStatus: createUserRes?.User?.UserStatus,
        email,
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

async function emailIsTaken(email) {
  const userParams = {
    UserPoolId: COGNITO_GENERIC_USER_POOL_ID,
    AttributesToGet: ['email'],
    Filter: `email = \"${email}\"`,
    Limit: 1,
  };

  const { Users } = await cognito.listUsers(userParams).promise();

  if (Users && Users.length > 0) return true;

  return false;
}

function createCognitoUserParams(data) {
  const { email } = data;
  return {
    UserPoolId: COGNITO_GENERIC_USER_POOL_ID,
    Username: uuid(),
    UserAttributes: [
      { Name: 'email', Value: email },
      {
        // This is probably not the best practice in the real world.
        // By doing this we are assuming the email is valid and that
        // the new user has access to the email address.
        // However, without this we cannot use the email as the username
        // when the user logs in for the first time.
        // As long as we don't supply the temporary password and suppress
        // the confirm email to the user though, they will need access
        // to the email address to get the initial password.
        // An alternative would be to verify the email before adding it
        // here.
        Name: 'email_verified',
        Value: 'true',
      },
    ],
    DesiredDeliveryMediums: ['EMAIL'],
  };
}
