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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllProblems({ status, difficulty, tag });
  }, [getAllProblems, status, difficulty, tag]);

  // Client-side search filtering
  const filteredProblems = problems.filter((problem) => {
    if (!searchTerm.trim()) return true;
    return problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm px-6 border-b border-base-300">
        <div className="flex-1">
          <Link to="/home" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span>Coding Platform</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 btn btn-sm btn-ghost normal-case font-normal hover:bg-base-200"
            >
              <div className="avatar placeholder">
                <div className="w-6 h-6 rounded-full bg-neutral text-neutral-content text-xs font-bold">
                  {user.firstName[0].toUpperCase()}
                </div>
              </div>
              <span className="text-xs text-base-content/70">
                Hello, <span className="font-semibold text-base-content">{user.firstName}</span>
              </span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin/problems" className="btn btn-sm btn-outline">
              Manage Problems
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-error btn-outline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page Content Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-base-100 rounded-2xl p-6 md:p-8 border border-base-300 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Level Up Your Skills 🚀
            </h1>
            <p className="text-sm text-base-content/60 max-w-xl">
              Solve interactive coding challenges, run code against custom testcases, and track your progress in detail.
            </p>
          </div>
          {user && (
            <Link to="/profile" className="btn btn-primary btn-sm md:btn-md shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>My Profile Dashboard</span>
            </Link>
          )}
        </div>

        {/* Dashboard Grid Card */}
        <div className="bg-base-100 rounded-2xl shadow-md border border-base-300 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Problems Database</h2>
            
            {/* Search input */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by title..."
                className="input input-bordered input-sm pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-xl border border-base-300">
            <label className="form-control w-full">
              <span className="label-text mb-1 font-semibold text-xs text-base-content/60 uppercase tracking-wider">Status</span>
              <select
                className="select select-sm select-bordered capitalize font-medium"
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
              <span className="label-text mb-1 font-semibold text-xs text-base-content/60 uppercase tracking-wider">Difficulty</span>
              <select
                className="select select-sm select-bordered capitalize font-medium"
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
              <span className="label-text mb-1 font-semibold text-xs text-base-content/60 uppercase tracking-wider">Topic Tag</span>
              <select
                className="select select-sm select-bordered capitalize font-medium"
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

          {/* Table list or loaders */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <span className="text-sm font-semibold text-base-content/50">Fetching problems list...</span>
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error shadow-sm rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filteredProblems.length === 0 && (
            <div className="text-center py-12 border border-dashed border-base-300 rounded-xl">
              <p className="text-base-content/60 text-sm">No problems match your current search/filter criteria.</p>
            </div>
          )}

          {!loading && !error && filteredProblems.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-base-300">
              <table className="table table-md w-full">
                <thead>
                  <tr className="bg-base-200">
                    <th className="w-12 text-center">Status</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th className="w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => {
                    const diffBadgeColors = {
                      Easy: "text-emerald-500 font-bold bg-emerald-500/10 border-emerald-500/20",
                      Medium: "text-amber-500 font-bold bg-amber-500/10 border-amber-500/20",
                      Hard: "text-rose-500 font-bold bg-rose-500/10 border-rose-500/20",
                    };

                    return (
                      <tr key={problem._id} className="hover:bg-base-200/50 transition-colors">
                        <td className="text-center">
                          {problem.status === "solved" ? (
                            <div className="tooltip" data-tip="Solved">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="tooltip" data-tip="Unsolved">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/problem/${problem._id}`}
                            className="font-bold text-sm link link-hover hover:text-primary transition-colors block py-1"
                          >
                            {problem.title}
                          </Link>
                        </td>
                        <td>
                          <span className={`badge badge-sm py-2 px-2.5 ${diffBadgeColors[problem.difficulty] || "badge-ghost"}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags && problem.tags.length > 0 ? (
                              problem.tags.map((tag) => (
                                <span key={tag} className="badge badge-sm badge-ghost text-[10px] py-1.5 font-medium">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-base-content/30 text-xs">-</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          <Link
                            to={`/problem/${problem._id}`}
                            className="btn btn-xs btn-primary font-bold shadow-sm"
                          >
                            Solve
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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
