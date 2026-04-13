import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import problemReducer from "../features/Problem/problem.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problem: problemReducer,
  },
});
