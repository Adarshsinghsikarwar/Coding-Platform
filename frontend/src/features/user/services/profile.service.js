import api from "../../../api/apiConfig";

export const getMySubmissions = async () => {
  const response = await api.get("/user/submissions");
  return response.data?.submissions || [];
};

export const getSolvedProblems = async () => {
  const response = await api.get("/user/problemSolvedByUser");
  return Array.isArray(response.data) ? response.data : [];
};
