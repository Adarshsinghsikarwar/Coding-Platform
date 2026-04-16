import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLogout } from "../../auth/hooks/useLogout";
import { useProblem } from "../hooks/useProblem";

const STATUS_OPTIONS = ["all", "solved", "unsolved"];
const DIFFICULTY_OPTIONS = ["all", "Easy", "Medium", "Hard"];
const TAG_OPTIONS = [
  "all",
  "Array",
  "String",
  "Dynamic Programming",
  "Graph",
  "Tree",
  "Math",
];

const Home = () => {
  const { handleLogout } = useLogout();
  const { user } = useSelector((state) => state.auth);
  const { problems, loading, error } = useSelector((state) => state.problem);
  const { getAllProblems } = useProblem();
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");

  useEffect(() => {
    getAllProblems({ status, difficulty, tag });
  }, [getAllProblems, status, difficulty, tag]);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">Coding Platform</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-base-content/70">
              Hello, <span className="font-medium">{user.firstName}</span>
            </span>
          )}
          {user?.role === "admin" && (
            <>
              <Link to="/admin/problems" className="btn btn-sm btn-outline">
                Manage Problems
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-error btn-outline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-6">
        <div className="bg-base-100 rounded-xl shadow-sm p-4">
          <h1 className="text-xl font-semibold mb-4">All Problems</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Status</span>
              <select
                className="select select-bordered"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Difficulty</span>
              <select
                className="select select-bordered"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label-text mb-1 font-medium">Tag</span>
              <select
                className="select select-bordered"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                {TAG_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading && (
            <p className="text-base-content/70">Loading problems...</p>
          )}

          {!loading && error && (
            <p className="text-error font-medium">{error}</p>
          )}

          {!loading && !error && problems.length === 0 && (
            <p className="text-base-content/70">No problems available.</p>
          )}

          {!loading && !error && problems.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr key={problem._id}>
                      <td>{index + 1}</td>
                      <td>
                        <Link
                          to={`/problem/${problem._id}`}
                          className="link link-hover font-medium"
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className="capitalize">{problem.status}</td>
                      <td>{problem.difficulty}</td>
                      <td>{problem.tags?.join(", ") || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
