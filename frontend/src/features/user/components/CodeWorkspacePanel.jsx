import Editor from "@monaco-editor/react";
import { toMonacoLanguage } from "../services/problemPage.service";

const CodeWorkspacePanel = ({
  selectedLanguage,
  currentCode,
  onLanguageChange,
  onCodeChange,
  onRun,
  onSubmit,
  runLoading,
  submitLoading,
  activeRightTab,
  onRightTabChange,
  runResult,
  runError,
  submitResult,
  submitError,
}) => {
  const rightTabs = [
    { key: "code", label: "Code" },
    { key: "testcase", label: "Testcase" },
    { key: "result", label: "Result" },
  ];

  const languages = [
    { key: "javascript", label: "JavaScript" },
    { key: "java", label: "Java" },
    { key: "c++", label: "C++" },
  ];

  return (
    <div className="w-1/2 flex flex-col">
      <div className="tabs tabs-bordered bg-base-200 px-4 pt-2">
        {rightTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeRightTab === tab.key ? "tab-active" : ""}`}
            onClick={() => onRightTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {activeRightTab === "code" && (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-base-300">
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.key}
                    className={`btn btn-sm ${
                      selectedLanguage === lang.key
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                    onClick={() => onLanguageChange(lang.key)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                language={toMonacoLanguage(selectedLanguage)}
                value={currentCode}
                onChange={(value) => onCodeChange(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: "on",
                }}
              />
            </div>

            <div className="p-4 border-t border-base-300 flex justify-end gap-2">
              <button
                className={`btn btn-outline btn-sm ${
                  runLoading ? "loading" : ""
                }`}
                onClick={onRun}
                disabled={runLoading || submitLoading}
              >
                Run
              </button>
              <button
                className={`btn btn-primary btn-sm ${
                  submitLoading ? "loading" : ""
                }`}
                onClick={onSubmit}
                disabled={runLoading || submitLoading}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {activeRightTab === "testcase" && (
          <div className="p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Test Result</h3>
            {runError && <p className="text-error mb-3">{runError}</p>}

            {!runResult && !runError && (
              <p className="text-base-content/70">
                Click Run to test your solution.
              </p>
            )}

            {runResult && (
              <div
                className={`alert ${
                  runResult.success ? "alert-success" : "alert-error"
                }`}
              >
                <div className="w-full">
                  <h4 className="font-bold">
                    {runResult.success
                      ? "All test cases passed"
                      : "Some test cases failed"}
                  </h4>
                  <p className="text-sm mt-2">
                    Runtime: {runResult.runtime || 0} sec
                  </p>
                  <p className="text-sm mb-3">
                    Memory: {runResult.memory || 0} KB
                  </p>

                  {!runResult.success && runResult.errorMessage && (
                    <p className="text-sm mb-3 whitespace-pre-wrap">
                      <strong>Error:</strong> {runResult.errorMessage}
                    </p>
                  )}

                  {Array.isArray(runResult.testCases) &&
                    runResult.testCases.length > 0 && (
                      <div className="space-y-2">
                        {runResult.testCases.map((testCase, index) => (
                          <div
                            key={index}
                            className="bg-base-100 p-3 rounded text-xs font-mono"
                          >
                            <div>
                              <strong>Input:</strong> {testCase.stdin}
                            </div>
                            <div>
                              <strong>Expected:</strong>{" "}
                              {testCase.expected_output}
                            </div>
                            <div>
                              <strong>Output:</strong> {testCase.stdout || "-"}
                            </div>
                            <div>
                              <strong>Error:</strong>{" "}
                              {testCase.stderr ||
                                testCase.compile_output ||
                                "-"}
                            </div>
                            <div
                              className={
                                testCase.status_id === 3
                                  ? "text-green-700"
                                  : "text-red-700"
                              }
                            >
                              {testCase.status_id === 3 ? "Passed" : "Failed"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeRightTab === "result" && (
          <div className="p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Submission Result</h3>
            {submitError && <p className="text-error mb-3">{submitError}</p>}

            {!submitResult && !submitError && (
              <p className="text-base-content/70">
                Click Submit to evaluate your solution.
              </p>
            )}

            {submitResult && (
              <div
                className={`alert ${
                  submitResult.accepted ? "alert-success" : "alert-error"
                }`}
              >
                <div>
                  <h4 className="font-bold text-lg">
                    {submitResult.accepted ? "Accepted" : "Not Accepted"}
                  </h4>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>
                      Test Cases Passed: {submitResult.passedTestCases || 0}/
                      {submitResult.totalTestCases || 0}
                    </p>
                    <p>Runtime: {submitResult.runtime || 0} sec</p>
                    <p>Memory: {submitResult.memory || 0} KB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeWorkspacePanel;
