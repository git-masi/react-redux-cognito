import { createSlice } from '@reduxjs/toolkit';
import superagent from 'superagent';

const initialState = { AccessToken: '', RefreshToken: '', IdToken: '' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateTokens(state, action) {
      const { payload } = action;
      return { ...state, ...payload };
    },
  },
});

export const { updateTokens } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;

export function initRefreshTimer(time, refreshToken) {
  return async (dispatch) => {
    setTimeout(async () => {
      try {
        const { authenticationResult } = await superagent
          .post(
            'https://z9zn346vaf.execute-api.us-east-1.amazonaws.com/dev/users/refresh'
          )
          .send({ refreshToken });

        dispatch(updateTokens(authenticationResult));

        dispatch(initRefreshTimer(time, refreshToken));
      } catch (error) {
        console.log(error);
      }
    }, time);
  };
}
