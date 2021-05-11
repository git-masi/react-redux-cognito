import { createSlice } from '@reduxjs/toolkit';

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
