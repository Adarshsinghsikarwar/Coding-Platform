import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  problems: [],
  loading: false,
  error: null,
};

const problemSlice = createSlice({
  name: "problem",
  initialState,
  reducers: {
    setAllProblem(state, action) {
      state.problems = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setProblemError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setAllProblem, setLoading, setProblemError } =
  problemSlice.actions;
export default problemSlice.reducer;
