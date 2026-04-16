const getDifficultyBadgeClass = (difficulty = "") => {
  const normalized = String(difficulty).toLowerCase();
  if (normalized === "easy") return "badge-success";
  if (normalized === "medium") return "badge-warning";
  if (normalized === "hard") return "badge-error";
  return "badge-ghost";
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const ProblemDetailsPanel = ({
  problem,
  activeLeftTab,
  onTabChange,
  submissions,
  submissionsLoading,
  submissionsError,
}) => {
  const visibleTestCases = problem?.visibleTestCases || [];
  const referenceSolutions = problem?.referenceSolution || [];

  const leftTabs = [
    { key: "description", label: "Description" },
    { key: "solutions", label: "Solutions" },
    { key: "submissions", label: "Submissions" },
  ];

  return (
    <div className="w-1/2 flex flex-col border-r border-base-300">
      <div className="tabs tabs-bordered bg-base-200 px-4 pt-2">
        {leftTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeLeftTab === tab.key ? "tab-active" : ""}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeLeftTab === "description" && (
          <div>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <h1 className="text-2xl font-bold">
                {problem?.title || "Problem"}
              </h1>
              <span
                className={`badge ${getDifficultyBadgeClass(
                  problem?.difficulty
                )}`}
              >
                {problem?.difficulty || "Unknown"}
              </span>
              {problem?.tags?.length > 0 && (
                <span className="badge badge-outline">
                  {problem.tags.join(", ")}
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {problem?.description || "No description available."}
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Examples</h3>
              {visibleTestCases.length === 0 ? (
                <p className="text-base-content/70">No examples available.</p>
              ) : (
                <div className="space-y-4">
                  {visibleTestCases.map((example, index) => (
                    <div key={index} className="bg-base-200 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        Example {index + 1}
                      </h4>
                      <div className="space-y-1 text-sm font-mono">
                        <div>
                          <strong>Input:</strong> {example.input}
                        </div>
                        <div>
                          <strong>Output:</strong> {example.output}
                        </div>
                        <div>
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeLeftTab === "solutions" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reference Solutions</h2>
            {referenceSolutions.length === 0 ? (
              <p className="text-base-content/70">
                No reference solutions available.
              </p>
            ) : (
              <div className="space-y-4">
                {referenceSolutions.map((solution, index) => (
                  <div
                    key={index}
                    className="border border-base-300 rounded-lg"
                  >
                    <div className="bg-base-200 px-4 py-2 rounded-t-lg font-semibold">
                      {solution.language}
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto bg-base-100">
                      <code>{solution.completeCode}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeLeftTab === "submissions" && (
          <div>
            <h2 className="text-xl font-bold mb-4">My Submissions</h2>
            {submissionsLoading && <p>Loading submissions...</p>}
            {!submissionsLoading && submissionsError && (
              <p className="text-error">{submissionsError}</p>
            )}
            {!submissionsLoading &&
              !submissionsError &&
              submissions.length === 0 && (
                <p className="text-base-content/70">No submissions yet.</p>
              )}

            {!submissionsLoading &&
              !submissionsError &&
              submissions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Passed</th>
                        <th>Runtime</th>
                        <th>Memory</th>
                        <th>Language</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission._id}>
                          <td className="capitalize">{submission.status}</td>
                          <td>
                            {submission.testCasesPassed}/
                            {submission.testCasesTotal}
                          </td>
                          <td>{submission.runtime || 0} sec</td>
                          <td>{submission.memory || 0} KB</td>
                          <td>{submission.language}</td>
                          <td>{formatDateTime(submission.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetailsPanel;
