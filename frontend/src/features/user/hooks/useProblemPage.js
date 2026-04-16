import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProblemById,
  getProblemSubmissions,
  runProblemCode,
  submitProblemCode,
  toApiLanguage,
} from "../services/problemPage.service";
import {
  resetProblemPageState,
  setCodeByLanguage,
  setProblem,
  setProblemError,
  setProblemLoading,
  setRunError,
  setRunLoading,
  setRunResult,
  setSelectedLanguage,
  setSubmitError,
  setSubmitLoading,
  setSubmitResult,
  setSubmissions,
  setSubmissionsError,
  setSubmissionsLoading,
  updateCodeForCurrentLanguage,
} from "../problemPage.slice";

const LANGUAGE_PRIORITY = ["javascript", "java", "c++"];

const getInitialCodeByLanguage = (startCode = []) => {
  const base = {
    javascript: "",
    java: "",
    "c++": "",
  };

  startCode.forEach((item) => {
    const language = item?.language;
    if (language && base[language] !== undefined) {
      base[language] = item.initialCode || "";
    }
  });

  return base;
};

const getDefaultLanguage = (codeByLanguage) => {
  const firstAvailable = LANGUAGE_PRIORITY.find(
    (lang) => codeByLanguage[lang] && codeByLanguage[lang].trim().length > 0
  );
  return firstAvailable || "javascript";
};

const getErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
};

export const useProblemPage = (problemId) => {
  const dispatch = useDispatch();
  const problemState = useSelector((state) => state.problemPage);

  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");

  const loadProblem = useCallback(async () => {
    try {
      dispatch(setProblemLoading(true));
      dispatch(setProblemError(null));

      const problem = await getProblemById(problemId);
      const codeByLanguage = getInitialCodeByLanguage(problem.startCode);
      const defaultLanguage = getDefaultLanguage(codeByLanguage);

      dispatch(setProblem(problem));
      dispatch(setCodeByLanguage(codeByLanguage));
      dispatch(setSelectedLanguage(defaultLanguage));
    } catch (error) {
      dispatch(
        setProblemError(getErrorMessage(error, "Failed to load problem"))
      );
    } finally {
      dispatch(setProblemLoading(false));
    }
  }, [dispatch, problemId]);

  const loadSubmissions = useCallback(async () => {
    try {
      dispatch(setSubmissionsLoading(true));
      dispatch(setSubmissionsError(null));

      const submissions = await getProblemSubmissions(problemId);
      dispatch(setSubmissions(submissions));
    } catch (error) {
      dispatch(
        setSubmissionsError(
          getErrorMessage(error, "Failed to load submissions")
        )
      );
    } finally {
      dispatch(setSubmissionsLoading(false));
    }
  }, [dispatch, problemId]);

  const changeLanguage = useCallback(
    (language) => {
      dispatch(setSelectedLanguage(language));
    },
    [dispatch]
  );

  const updateCode = useCallback(
    (nextCode) => {
      dispatch(updateCodeForCurrentLanguage(nextCode || ""));
    },
    [dispatch]
  );

  const runCode = useCallback(async () => {
    try {
      dispatch(setRunLoading(true));
      dispatch(setRunError(null));
      dispatch(setRunResult(null));

      const payload = {
        code: problemState.codeByLanguage[problemState.selectedLanguage] || "",
        language: toApiLanguage(problemState.selectedLanguage),
      };

      const result = await runProblemCode(problemId, payload);
      dispatch(setRunResult(result));
      setActiveRightTab("testcase");
    } catch (error) {
      dispatch(setRunResult(null));
      dispatch(setRunError(getErrorMessage(error, "Failed to run code")));
      setActiveRightTab("testcase");
    } finally {
      dispatch(setRunLoading(false));
    }
  }, [
    dispatch,
    problemId,
    problemState.codeByLanguage,
    problemState.selectedLanguage,
  ]);

  const submitCode = useCallback(async () => {
    try {
      dispatch(setSubmitLoading(true));
      dispatch(setSubmitError(null));
      dispatch(setSubmitResult(null));

      const payload = {
        code: problemState.codeByLanguage[problemState.selectedLanguage] || "",
        language: toApiLanguage(problemState.selectedLanguage),
      };

      const result = await submitProblemCode(problemId, payload);
      dispatch(setSubmitResult(result));
      setActiveRightTab("result");

      await loadSubmissions();
    } catch (error) {
      dispatch(setSubmitResult(null));
      dispatch(
        setSubmitError(getErrorMessage(error, "Failed to submit solution"))
      );
      setActiveRightTab("result");
    } finally {
      dispatch(setSubmitLoading(false));
    }
  }, [
    dispatch,
    loadSubmissions,
    problemId,
    problemState.codeByLanguage,
    problemState.selectedLanguage,
  ]);

  const cleanup = useCallback(() => {
    dispatch(resetProblemPageState());
  }, [dispatch]);

  const currentCode = useMemo(() => {
    return problemState.codeByLanguage[problemState.selectedLanguage] || "";
  }, [problemState.codeByLanguage, problemState.selectedLanguage]);

  return {
    ...problemState,
    currentCode,
    activeLeftTab,
    activeRightTab,
    setActiveLeftTab,
    setActiveRightTab,
    loadProblem,
    loadSubmissions,
    changeLanguage,
    updateCode,
    runCode,
    submitCode,
    cleanup,
  };
};
