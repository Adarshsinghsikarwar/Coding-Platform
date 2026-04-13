import { api } from "../../../api/apiConfig";

export const fetchAllProblems = async () => {
  try {
    const response = await api.get("user/getAllProblem");
    return response.data;
  } catch (err) {
    console.error("Error fetching problems:", err);
    throw err;
  }
};
