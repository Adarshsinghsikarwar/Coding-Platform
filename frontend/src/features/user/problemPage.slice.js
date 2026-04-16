import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  problem: null,
  problemLoading: false,
  problemError: null,

  selectedLanguage: "javascript",
  codeByLanguage: {
    javascript: "",
    java: "",
    "c++": "",
  },

  runLoading: false,
  runResult: null,
  runError: null,

  submitLoading: false,
  submitResult: null,
  submitError: null,

  submissions: [],
  submissionsLoading: false,
  submissionsError: null,
};

const problemPageSlice = createSlice({
  name: "problemPage",
  initialState,
  reducers: {
    resetProblemPageState() {
      return initialState;
    },

    setProblemLoading(state, action) {
      state.problemLoading = action.payload;
    },
    setProblemError(state, action) {
      state.problemError = action.payload;
    },
    setProblem(state, action) {
      state.problem = action.payload;
    },

    setSelectedLanguage(state, action) {
      state.selectedLanguage = action.payload;
    },
    setCodeByLanguage(state, action) {
      state.codeByLanguage = action.payload;
    },
    updateCodeForCurrentLanguage(state, action) {
      state.codeByLanguage[state.selectedLanguage] = action.payload;
    },

    setRunLoading(state, action) {
      state.runLoading = action.payload;
    },
    setRunResult(state, action) {
      state.runResult = action.payload;
    },
    setRunError(state, action) {
      state.runError = action.payload;
    },

    setSubmitLoading(state, action) {
      state.submitLoading = action.payload;
    },
    setSubmitResult(state, action) {
      state.submitResult = action.payload;
    },
    setSubmitError(state, action) {
      state.submitError = action.payload;
    },

    setSubmissionsLoading(state, action) {
      state.submissionsLoading = action.payload;
    },
    setSubmissionsError(state, action) {
      state.submissionsError = action.payload;
    },
    setSubmissions(state, action) {
      state.submissions = action.payload;
    },
  },
});

export const {
  resetProblemPageState,
  setProblemLoading,
  setProblemError,
  setProblem,
  setSelectedLanguage,
  setCodeByLanguage,
  updateCodeForCurrentLanguage,
  setRunLoading,
  setRunResult,
  setRunError,
  setSubmitLoading,
  setSubmitResult,
  setSubmitError,
  setSubmissionsLoading,
  setSubmissionsError,
  setSubmissions,
} = problemPageSlice.actions;

export default problemPageSlice.reducer;
