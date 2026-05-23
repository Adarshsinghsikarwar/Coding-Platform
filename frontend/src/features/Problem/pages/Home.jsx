import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useLogout } from "../../auth/hooks/useLogout";
import { useProblem } from "../hooks/useProblem";
import { fetchAllProblems } from "../services/problem.api";

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
  const [allProblemsForStats, setAllProblemsForStats] = useState([]);
  const [recommendedProblem, setRecommendedProblem] = useState(null);

  // Fetch problems list on filters change
  useEffect(() => {
    getAllProblems({ status, difficulty, tag });
  }, [getAllProblems, status, difficulty, tag]);

  // Fetch all problems once for static stats computation & recommendations
  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchAllProblems({});
        setAllProblemsForStats(data);
      } catch (err) {
        console.error("Failed to load stats data", err);
      }
    };
    getStats();
  }, []);

  // Set recommended problem once stats are loaded
  useEffect(() => {
    if (allProblemsForStats.length > 0) {
      const unsolved = allProblemsForStats.filter((p) => p.status === "unsolved");
      if (unsolved.length > 0) {
        const randomPick = unsolved[Math.floor(Math.random() * unsolved.length)];
        setRecommendedProblem(randomPick);
      }
    }
  }, [allProblemsForStats]);

  // Client-side search filtering
  const filteredProblems = problems.filter((problem) => {
    if (!searchTerm.trim()) return true;
    return problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Stats calculations
  const totalProblems = allProblemsForStats.length;
  const solvedProblems = allProblemsForStats.filter((p) => p.status === "solved");
  const totalSolved = solvedProblems.length;

  const easyProblems = allProblemsForStats.filter((p) => p.difficulty === "Easy");
  const solvedEasy = easyProblems.filter((p) => p.status === "solved").length;

  const mediumProblems = allProblemsForStats.filter((p) => p.difficulty === "Medium");
  const solvedMedium = mediumProblems.filter((p) => p.status === "solved").length;

  const hardProblems = allProblemsForStats.filter((p) => p.difficulty === "Hard");
  const solvedHard = hardProblems.filter((p) => p.status === "solved").length;

  const solvedPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <div className="min-h-screen bg-base-200 text-base-content font-sans">
      {/* Translucent Glass Navbar */}
      <div className="navbar bg-base-100/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-base-300 px-4 md:px-8">
        <div className="flex-1">
          <Link to="/home" className="text-xl font-black flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">Coding Platform</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 btn btn-sm btn-ghost normal-case font-medium hover:bg-base-200 rounded-xl"
            >
              <div className="avatar placeholder">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/20 flex items-center justify-center text-xs font-black">
                  {user.firstName[0].toUpperCase()}
                </div>
              </div>
              <span className="hidden sm:inline text-xs text-base-content/70">
                Hello, <span className="font-semibold text-base-content">{user.firstName}</span>
              </span>
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin/problems" className="btn btn-sm btn-outline btn-neutral rounded-xl font-semibold shadow-xs">
              Manage Problems
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-error btn-outline rounded-xl font-semibold shadow-xs"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Welcome Hero & Quick Recommendation Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Welcome Banner */}
          <div className="lg:col-span-2 relative overflow-hidden bg-radial from-primary/10 via-base-100 to-base-100 rounded-3xl p-6 md:p-8 border border-base-300 shadow-sm flex flex-col justify-between min-h-[180px]">
            <div className="space-y-2 z-10">
              <span className="badge badge-sm badge-primary font-bold tracking-wider uppercase">Welcome Back</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-base-content">
                Hey, {user?.firstName || "Developer"}! 👋
              </h1>
              <p className="text-sm md:text-base text-base-content/70 max-w-lg">
                Ready to conquer today\'s challenges? Boost your code efficiency, learn new algorithms, and refine your logic.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 items-center justify-between border-t border-base-300/40 pt-4 z-10">
              <span className="text-sm font-medium text-base-content/60">
                Current Success Rate: <span className="font-bold text-primary">{solvedPercentage}%</span>
              </span>
              <Link to="/profile" className="btn btn-primary btn-sm rounded-xl font-bold gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Dashboard Profile
              </Link>
            </div>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl -z-0 translate-x-10 -translate-y-10" />
          </div>

          {/* Recommended Problem Widget */}
          <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-secondary uppercase tracking-widest">Recommended Challenge</span>
                <span className="animate-pulse flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
              </div>
              {recommendedProblem ? (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-base-content line-clamp-1">
                    {recommendedProblem.title}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <span className={`badge badge-sm py-2 px-2.5 font-bold ${
                      recommendedProblem.difficulty === "Easy" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                      recommendedProblem.difficulty === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                      "text-rose-500 bg-rose-500/10 border-rose-500/20"
                    }`}>
                      {recommendedProblem.difficulty}
                    </span>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {recommendedProblem.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="badge badge-xs badge-ghost font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-base-content/60 py-2">
                  All caught up! You\'ve solved every available challenge in the system.
                </p>
              )}
            </div>

            {recommendedProblem && (
              <Link
                to={`/problem/${recommendedProblem._id}`}
                className="btn btn-secondary btn-sm w-full rounded-xl mt-4 font-bold gap-1 shadow-md shadow-secondary/10"
              >
                Solve Now
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar / Stats Card (4 cols wide) */}
          <div className="lg:col-span-4 bg-base-100 rounded-3xl border border-base-300 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold border-b border-base-200 pb-3">My Coding Analytics</h2>

            {/* Circular Progress Display */}
            <div className="flex flex-col items-center py-2 space-y-2">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-base-200 fill-none"
                    strokeWidth="10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-primary fill-none transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - solvedPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black">{totalSolved}</span>
                  <span className="text-[10px] uppercase font-bold text-base-content/40">Solved</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-base-content/60">
                Solved <span className="text-primary font-bold">{totalSolved}</span> of <span className="font-bold text-base-content">{totalProblems}</span> problems
              </span>
            </div>

            {/* Difficulty Breakdown Progression Bars */}
            <div className="space-y-4 pt-2">
              {/* Easy Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-500 font-bold uppercase tracking-wider">Easy</span>
                  <span className="font-semibold text-base-content/85">{solvedEasy} / {easyProblems.length}</span>
                </div>
                <progress
                  className="progress progress-success w-full h-2.5 rounded-full"
                  value={easyProblems.length > 0 ? solvedEasy : 0}
                  max={easyProblems.length > 0 ? easyProblems.length : 1}
                />
              </div>

              {/* Medium Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-500 font-bold uppercase tracking-wider">Medium</span>
                  <span className="font-semibold text-base-content/85">{solvedMedium} / {mediumProblems.length}</span>
                </div>
                <progress
                  className="progress progress-warning w-full h-2.5 rounded-full"
                  value={mediumProblems.length > 0 ? solvedMedium : 0}
                  max={mediumProblems.length > 0 ? mediumProblems.length : 1}
                />
              </div>

              {/* Hard Progress */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-rose-500 font-bold uppercase tracking-wider">Hard</span>
                  <span className="font-semibold text-base-content/85">{solvedHard} / {hardProblems.length}</span>
                </div>
                <progress
                  className="progress progress-error w-full h-2.5 rounded-full"
                  value={hardProblems.length > 0 ? solvedHard : 0}
                  max={hardProblems.length > 0 ? hardProblems.length : 1}
                />
              </div>
            </div>
          </div>

          {/* Main Area / Problems Library (8 cols wide) */}
          <div className="lg:col-span-8 bg-base-100 rounded-3xl border border-base-300 shadow-sm p-6 space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-200 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Problems Library</h2>
                <p className="text-xs text-base-content/50 mt-0.5">Explore challenges, find templates, and write solutions.</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:max-w-xs">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-base-content/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search problem titles..."
                  className="input input-bordered input-sm pl-10 pr-4 w-full rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Chips Groups */}
            <div className="space-y-4 bg-base-200/40 p-4 rounded-2xl border border-base-300/60">
              
              {/* Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest min-w-[70px]">Status:</span>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = status === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => setStatus(opt)}
                        className={`btn btn-xs rounded-xl font-bold capitalize transition-all duration-200 ${
                          isActive
                            ? "btn-primary text-white shadow-xs border-primary"
                            : "btn-ghost border border-base-300 hover:bg-base-200/70"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest min-w-[70px]">Difficulty:</span>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((diff) => {
                    const isActive = difficulty === diff;
                    const styles = {
                      all: isActive ? "btn-neutral text-white border-neutral shadow-xs" : "btn-ghost border border-base-300 hover:bg-base-200/70",
                      Easy: isActive ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20" : "text-emerald-500/90 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
                      Medium: isActive ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20" : "text-amber-500/90 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10",
                      Hard: isActive ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20" : "text-rose-500/90 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10",
                    };
                    return (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`btn btn-xs rounded-xl font-bold transition-all duration-300 ${styles[diff]}`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Filters */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 pt-1">
                <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-widest min-w-[70px] mt-1.5">Topic tags:</span>
                <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
                  {TAG_OPTIONS.map((t) => {
                    const isActive = tag === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTag(t)}
                        className={`badge badge-md cursor-pointer font-bold rounded-lg transition-all duration-200 ${
                          isActive
                            ? "badge-secondary text-white shadow-xs border-secondary py-2 px-3 scale-105"
                            : "badge-ghost border border-base-300 text-base-content/75 hover:bg-base-200/80 py-2 px-3"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List / Table loaders & results */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-base-100 rounded-2xl border border-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="text-sm font-semibold text-base-content/50">Hydrating code catalog...</span>
              </div>
            )}

            {!loading && error && (
              <div className="alert alert-error shadow-sm rounded-2xl border-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">{error}</span>
              </div>
            )}

            {!loading && !error && filteredProblems.length === 0 && (
              <div className="text-center py-16 border-2 border-dashed border-base-300 rounded-3xl bg-base-200/10">
                <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3 text-base-content/40">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base-content mb-0.5">No Matches Found</h3>
                <p className="text-base-content/50 text-xs max-w-xs mx-auto">No problems match your current criteria. Try expanding search keywords or resetting filters.</p>
              </div>
            )}

            {!loading && !error && filteredProblems.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-base-300">
                <table className="table table-md w-full">
                  <thead>
                    <tr className="bg-base-200/70 border-b border-base-300">
                      <th className="w-16 text-center text-xs font-bold uppercase tracking-wider text-base-content/60">Status</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-base-content/60">Title</th>
                      <th className="w-28 text-xs font-bold uppercase tracking-wider text-base-content/60">Difficulty</th>
                      <th className="text-xs font-bold uppercase tracking-wider text-base-content/60">Tags</th>
                      <th className="w-24 text-center text-xs font-bold uppercase tracking-wider text-base-content/60">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem) => {
                      const diffColors = {
                        Easy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                        Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                        Hard: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                      };

                      const activeDiffBtnGlow = {
                        Easy: "hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/20",
                        Medium: "hover:bg-amber-500 hover:text-white hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/20",
                        Hard: "hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/20",
                      };

                      return (
                        <tr key={problem._id} className="hover:bg-base-200/30 transition-colors border-b border-base-200">
                          <td className="text-center py-4">
                            {problem.status === "solved" ? (
                              <div className="tooltip" data-tip="Solved">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              </div>
                            ) : (
                              <div className="tooltip" data-tip="Unsolved">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-base-300 text-base-content/20 mx-auto">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                  </svg>
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/problem/${problem._id}`}
                              className="font-bold text-sm link link-hover hover:text-primary transition-colors block py-0.5 line-clamp-1"
                            >
                              {problem.title}
                            </Link>
                          </td>
                          <td className="py-4">
                            <span className={`badge badge-sm py-2 px-2.5 font-bold tracking-wide ${diffColors[problem.difficulty] || "badge-ghost"}`}>
                              {problem.difficulty}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {problem.tags && problem.tags.length > 0 ? (
                                problem.tags.map((tag) => (
                                  <span key={tag} className="badge badge-sm bg-base-200 border border-base-300 text-[10px] py-2 font-semibold text-base-content/70 rounded-md">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-base-content/30 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <Link
                              to={`/problem/${problem._id}`}
                              className={`btn btn-xs rounded-lg font-bold border border-base-300 bg-base-100 text-base-content shadow-xs transition-all duration-300 ${activeDiffBtnGlow[problem.difficulty] || "hover:bg-primary hover:text-white"}`}
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
    </div>
  );
};

export default Home;
