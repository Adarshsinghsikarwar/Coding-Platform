import { useDispatch } from "react-redux";
import { fetchAllProblems } from "../services/problem.api";

export const useProblem = () => {
  const dispatch = useDispatch();

  async function getAllProblems() {
    const data = await fetchAllProblems();
    dispatch(data.getProblem);
  }

  return {
    getAllProblems,
  };
}
