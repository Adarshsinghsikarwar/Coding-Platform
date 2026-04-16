import { useEffect, useState } from "react";
import { getProblemSubmissions } from "../../user/services/problemPage.service";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!problemId) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getProblemSubmissions(problemId);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error my-4">
        <span>{error}</span>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="alert alert-info my-4">
        <span>No submissions yet.</span>
      </div>
    );
  }

  return (
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
                {submission.testCasesPassed}/{submission.testCasesTotal}
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
  );
};

export default SubmissionHistory;
