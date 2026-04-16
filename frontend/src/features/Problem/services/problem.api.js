import api from "../../../api/apiConfig";

export const fetchAllProblems = async (filters = {}) => {
  try {
    const response = await api.get("/user/getAllProblem", {
      params: filters,
    });
    return response.data?.getProblem || [];
  } catch (err) {
    console.error("Error fetching problems:", err);
    throw err;
  }
};

export const createProblem = async (problemData) => {
  const response = await api.post("/problems/create", problemData);
  return response.data;
};

export const getProblemByIdForAdmin = async (problemId) => {
  const response = await api.get(`/problems/${problemId}`);
  return response.data?.problem || response.data;
};

export const updateProblemById = async (problemId, payload) => {
  const response = await api.put(`/problems/update/${problemId}`, payload);
  return response.data;
};

export const deleteProblemById = async (problemId) => {
  const response = await api.delete(`/problems/delete/${problemId}`);
  return response.data;
};
