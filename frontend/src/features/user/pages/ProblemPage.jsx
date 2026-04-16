import { useEffect } from "react";
import { useParams } from "react-router";
import { useProblemPage } from "../hooks/useProblemPage";
import ProblemDetailsPanel from "../components/ProblemDetailsPanel";
import CodeWorkspacePanel from "../components/CodeWorkspacePanel";

const ProblemPage = () => {
  const { problemId } = useParams();

  const {
    problem,
    problemLoading,
    problemError,
    selectedLanguage,
    currentCode,
    runLoading,
    runResult,
    runError,
    submitLoading,
    submitResult,
    submitError,
    submissions,
    submissionsLoading,
    submissionsError,
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
  } = useProblemPage(problemId);

  useEffect(() => {
    if (!problemId) return;
    loadProblem();
    loadSubmissions();

    return () => {
      cleanup();
    };
  }, [cleanup, loadProblem, loadSubmissions, problemId]);

  if (problemLoading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (problemError && !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="alert alert-error max-w-xl">
          <span>{problemError}</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100">
      <ProblemDetailsPanel
        problem={problem}
        activeLeftTab={activeLeftTab}
        onTabChange={setActiveLeftTab}
        submissions={submissions}
        submissionsLoading={submissionsLoading}
        submissionsError={submissionsError}
      />

      <CodeWorkspacePanel
        selectedLanguage={selectedLanguage}
        currentCode={currentCode}
        onLanguageChange={changeLanguage}
        onCodeChange={updateCode}
        onRun={runCode}
        onSubmit={submitCode}
        runLoading={runLoading}
        submitLoading={submitLoading}
        activeRightTab={activeRightTab}
        onRightTabChange={setActiveRightTab}
        runResult={runResult}
        runError={runError}
        submitResult={submitResult}
        submitError={submitError}
      />
    </div>
  );
};

export default ProblemPage;
