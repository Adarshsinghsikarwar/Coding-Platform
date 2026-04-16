import api from "../../../api/apiConfig";

const LANGUAGE_LABEL_TO_API = {
  javascript: "javascript",
  java: "java",
  cpp: "c++",
  "c++": "c++",
};

export const toApiLanguage = (language) => {
  return LANGUAGE_LABEL_TO_API[language] || "javascript";
};

export const toMonacoLanguage = (language) => {
  if (language === "c++") return "cpp";
  return language || "javascript";
};

const normalizeProblem = (rawProblem = {}) => {
  return {
    ...rawProblem,
    tags: Array.isArray(rawProblem.tags) ? rawProblem.tags : [],
    visibleTestCases: Array.isArray(rawProblem.visibleTestCases)
      ? rawProblem.visibleTestCases
      : [],
    startCode: Array.isArray(rawProblem.startCode) ? rawProblem.startCode : [],
    referenceSolution: Array.isArray(rawProblem.referenceSolution)
      ? rawProblem.referenceSolution
      : [],
  };
};

export const getProblemById = async (problemId) => {
  const response = await api.get(`/user/problemById/${problemId}`);
  const rawProblem = response.data?.problem || response.data;
  return normalizeProblem(rawProblem);
};

export const runProblemCode = async (problemId, payload) => {
  const response = await api.post(
    `/problemSubmitting/run/${problemId}`,
    payload
  );
  return response.data;
};

export const submitProblemCode = async (problemId, payload) => {
  const response = await api.post(
    `/problemSubmitting/submit/${problemId}`,
    payload
  );
  return response.data;
};

export const getProblemSubmissions = async (problemId) => {
  try {
    const response = await api.get(`/user/getSubmission/${problemId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
};
