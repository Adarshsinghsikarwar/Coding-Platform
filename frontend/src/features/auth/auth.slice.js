import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
  otpEmail: null, // stores email after registration for OTP page
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.error = null;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setOtpEmail(state, action) {
      state.otpEmail = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isLoading = false;
      state.error = null;
      state.otpEmail = null;
    },
  },
});

export const { setUser, setLoading, setError, setOtpEmail, clearError, logout } =
  authSlice.actions;

export default authSlice.reducer;
