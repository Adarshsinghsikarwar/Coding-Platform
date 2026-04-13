import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  problem: null,
  loading: false,
  error: null,
};

const problemSlice = createSlice({
  name: "problem",
  initialState,
  reducers: {
    setAllProblem(state, action) {
      state.problem = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setAllProblem, setLoading } = problemSlice.actions;
export default problemSlice.reducer;
