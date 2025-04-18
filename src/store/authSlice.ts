import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  id: number | null;
  username: string | null;
  credits: number | null;
  token: string | null;
  isAuth: boolean;
}

const initialState: AuthState = {
  id: null,
  username: null,
  credits: null,
  token: null,
  isAuth: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ id: number; username: string; credits: number; token: string }>
    ) {
      Object.assign(state, { ...action.payload, isAuth: true });
    },
    logout(state) {
      Object.assign(state, initialState);
    },
    updateCredits(state, action: PayloadAction<number>) {
      state.credits = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateCredits } = authSlice.actions;
export default authSlice.reducer;
