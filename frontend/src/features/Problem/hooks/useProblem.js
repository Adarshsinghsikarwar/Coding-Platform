import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  fetchAllProblems,
  createProblem as createProblemApi,
  getProblemByIdForAdmin as getProblemByIdForAdminApi,
  updateProblemById as updateProblemByIdApi,
  deleteProblemById as deleteProblemByIdApi,
} from "../services/problem.api";
import { setAllProblem, setLoading, setProblemError } from "../problem.slice";

export const useProblem = () => {
  const dispatch = useDispatch();

  const getAllProblems = useCallback(
    async (filters = {}) => {
      try {
        dispatch(setLoading(true));
        dispatch(setProblemError(null));

        const problems = await fetchAllProblems(filters);
        dispatch(setAllProblem(problems));
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load problems";
        dispatch(setProblemError(message));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );
  const createProblem = useCallback(
    async (problemData) => {
      try {
        dispatch(setLoading(true));
        dispatch(setProblemError(null));

        const response = await createProblemApi(problemData);
        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to create problem";
        dispatch(setProblemError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const getProblemByIdForAdmin = useCallback(
    async (problemId) => {
      try {
        dispatch(setProblemError(null));
        const problem = await getProblemByIdForAdminApi(problemId);
        return problem;
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load problem details";
        dispatch(setProblemError(message));
        throw error;
      }
    },
    [dispatch]
  );

  const updateProblemById = useCallback(
    async (problemId, payload) => {
      try {
        dispatch(setLoading(true));
        dispatch(setProblemError(null));
        const response = await updateProblemByIdApi(problemId, payload);
        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to update problem";
        dispatch(setProblemError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const deleteProblemById = useCallback(
    async (problemId) => {
      try {
        dispatch(setLoading(true));
        dispatch(setProblemError(null));
        const response = await deleteProblemByIdApi(problemId);
        return response;
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to delete problem";
        dispatch(setProblemError(message));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return {
    getAllProblems,
    createProblem,
    getProblemByIdForAdmin,
    updateProblemById,
    deleteProblemById,
  };
};
