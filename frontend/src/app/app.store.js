import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import problemReducer from "../features/Problem/problem.slice";
import problemPageReducer from "../features/user/problemPage.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problem: problemReducer,
    problemPage: problemPageReducer,
  },
});
