import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { getMySubmissions, getSolvedProblems } from "../services/profile.service";
import { fetchAllProblems } from "../../Problem/services/problem.api";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [submissions, setSubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      try {
        setLoadingData(true);
        setErrorData(null);

        const [subs, solved, allProbs] = await Promise.all([
          getMySubmissions(),
          getSolvedProblems(),
          fetchAllProblems(),
        ]);

        setSubmissions(subs);
        setSolvedProblems(solved);
        setAllProblems(allProbs);
      } catch (err) {
        console.error("Error loading profile data:", err);
        setErrorData("Failed to load profile details. Please try again.");
      } finally {
        setLoadingData(false);
      }
    };

    loadProfileData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-xl p-8 w-full max-w-md text-center border border-base-300">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-base-content/70 mb-6">Please log in to view your profile and tracking dashboard.</p>
          <button
            className="btn btn-primary w-full"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate difficulty stats
  const totalProblems = allProblems.length;
  const easyTotal = allProblems.filter((p) => p.difficulty === "Easy").length;
  const mediumTotal = allProblems.filter((p) => p.difficulty === "Medium").length;
  const hardTotal = allProblems.filter((p) => p.difficulty === "Hard").length;

  const solvedTotal = solvedProblems.length;
  const easySolved = solvedProblems.filter((p) => p.difficulty === "Easy").length;
  const mediumSolved = solvedProblems.filter((p) => p.difficulty === "Medium").length;
  const hardSolved = solvedProblems.filter((p) => p.difficulty === "Hard").length;

  // Percentage calculations
  const solvedPercent = totalProblems > 0 ? Math.round((solvedTotal / totalProblems) * 100) : 0;
  const easyPercent = easyTotal > 0 ? Math.round((easySolved / easyTotal) * 100) : 0;
  const mediumPercent = mediumTotal > 0 ? Math.round((mediumSolved / mediumTotal) * 100) : 0;
  const hardPercent = hardTotal > 0 ? Math.round((hardSolved / hardTotal) * 100) : 0;

  // Topic/Tags breakdown
  const tagCounts = {};
  solvedProblems.forEach((p) => {
    if (Array.isArray(p.tags)) {
      p.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  // SVG Circular progress details
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (solvedPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-sm px-6">
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
        <div className="flex items-center gap-3">
          <Link to="/home" className="btn btn-sm btn-ghost">
            All Problems
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin/problems" className="btn btn-sm btn-outline btn-neutral">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {errorData && (
          <div className="alert alert-error shadow-sm rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorData}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Profile Details & Skills/Tags */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Info Card */}
            <div className="card bg-base-100 shadow-md border border-base-300 overflow-hidden">
              {/* Profile Background Banner Decor */}
              <div className="h-24 bg-gradient-to-r from-primary to-secondary relative"></div>
              
              <div className="px-6 pb-6 relative">
                {/* Avatar with Initials */}
                <div className="avatar placeholder -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-base-100 bg-neutral text-neutral-content text-2xl font-bold flex items-center justify-center shadow-lg">
                    {user.firstName[0].toUpperCase()}
                    {user.lastName ? user.lastName[0].toUpperCase() : ""}
                  </div>
                </div>

                {/* Name & Role */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <span className={`badge ${user.role === "admin" ? "badge-primary" : "badge-neutral"} badge-sm uppercase font-semibold tracking-wider`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-base-content/60 text-sm">@{user.emailId.split("@")[0]}</p>
                </div>

                <div className="divider my-4"></div>

                {/* Profile Meta Info list */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60 font-medium">Email</span>
                    <span className="font-semibold break-all text-right max-w-[70%]">{user.emailId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60 font-medium">Age</span>
                    <span className="font-semibold">{user.age || 18} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60 font-medium">Auth Provider</span>
                    <span className="badge badge-sm badge-outline font-medium capitalize">{user.authProvider || "local"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/60 font-medium">Member Since</span>
                    <span className="font-semibold text-base-content/80">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solved Tags (Skill breakdown) Card */}
            <div className="card bg-base-100 shadow-md border border-base-300 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Skills & Tags</span>
              </h3>
              
              {loadingData ? (
                <div className="flex justify-center py-6">
                  <span className="loading loading-ring loading-md text-secondary"></span>
                </div>
              ) : sortedTags.length === 0 ? (
                <p className="text-base-content/60 text-sm text-center py-4">Solve problems to display skill breakdown.</p>
              ) : (
                <div className="space-y-4">
                  {sortedTags.map(([tag, count]) => {
                    const tagPercentage = solvedTotal > 0 ? Math.round((count / solvedTotal) * 100) : 0;
                    return (
                      <div key={tag} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="badge badge-sm badge-ghost py-2">{tag}</span>
                          <span className="text-base-content/70">
                            {count} Solved ({tagPercentage}%)
                          </span>
                        </div>
                        <progress
                          className="progress progress-secondary w-full"
                          value={count}
                          max={solvedTotal}
                        ></progress>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Statistics & Recent Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Dashboard Card (LeetCode Vibe) */}
            <div className="card bg-base-100 shadow-md border border-base-300 p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Solved Statistics</span>
              </h3>

              {loadingData ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-infinity loading-lg text-primary"></span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Circle Chart */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          className="stroke-base-200"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r={radius}
                          className="stroke-primary transition-all duration-500"
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      {/* Inner Centered Text */}
                      <div className="absolute text-center">
                        <div className="text-2xl font-black">{solvedTotal}</div>
                        <div className="text-[10px] uppercase font-bold text-base-content/50">Solved</div>
                        <div className="text-xs text-base-content/60 border-t border-base-300 mt-1 pt-0.5">
                          of {totalProblems}
                        </div>
                      </div>
                    </div>
                    <span className="mt-3 text-xs font-semibold badge badge-primary">{solvedPercent}% Complete</span>
                  </div>

                  {/* Difficulty Progress Bars */}
                  <div className="md:col-span-8 space-y-4">
                    {/* Easy Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Easy
                        </span>
                        <span className="text-xs font-bold">
                          {easySolved} <span className="text-base-content/40">/ {easyTotal}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${easyPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Medium Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-semibold text-amber-500 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          Medium
                        </span>
                        <span className="text-xs font-bold">
                          {mediumSolved} <span className="text-base-content/40">/ {mediumTotal}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${mediumPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Hard Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                          Hard
                        </span>
                        <span className="text-xs font-bold">
                          {hardSolved} <span className="text-base-content/40">/ {hardTotal}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${hardPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Submissions Card */}
            <div className="card bg-base-100 shadow-md border border-base-300 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span>Recent Submissions</span>
                </span>
                <span className="text-xs font-normal text-base-content/50">Last {submissions.length} attempts</span>
              </h3>

              {loadingData ? (
                <div className="flex justify-center items-center py-12">
                  <span className="loading loading-dots loading-md text-info"></span>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-base-300 rounded-xl">
                  <p className="text-base-content/60 text-sm mb-4">You haven't submitted code for any problems yet.</p>
                  <Link to="/home" className="btn btn-sm btn-primary">
                    Browse Problems
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th>Status</th>
                        <th>Lang</th>
                        <th className="hidden md:table-cell">Details</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => {
                        const statusColors = {
                          accepted: "text-emerald-500 font-semibold bg-emerald-500/10 border-emerald-500/20",
                          wrong: "text-rose-500 font-semibold bg-rose-500/10 border-rose-500/20",
                          error: "text-amber-500 font-semibold bg-amber-500/10 border-amber-500/20",
                          pending: "text-base-content/60 bg-base-200 border-base-300",
                        };

                        const diffColors = {
                          Easy: "text-emerald-500",
                          Medium: "text-amber-500",
                          Hard: "text-rose-500",
                        };

                        const problem = sub.problemId || {};

                        return (
                          <tr key={sub._id} className="hover:bg-base-200/50 transition-colors">
                            <td>
                              {problem._id ? (
                                <div className="flex flex-col">
                                  <Link
                                    to={`/problem/${problem._id}`}
                                    className="link link-hover font-semibold text-sm line-clamp-1"
                                  >
                                    {problem.title || "Unknown Problem"}
                                  </Link>
                                  <span className={`text-[10px] font-bold uppercase ${diffColors[problem.difficulty]}`}>
                                    {problem.difficulty || "-"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-base-content/40 font-medium">Deleted Problem</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge badge-sm py-2 px-2.5 capitalize ${statusColors[sub.status] || "badge-ghost"}`}>
                                {sub.status === "wrong" ? "Wrong Answer" : sub.status}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-sm badge-outline font-mono capitalize">{sub.language}</span>
                            </td>
                            <td className="hidden md:table-cell">
                              <div className="text-[10px] text-base-content/60 font-mono">
                                <span>{sub.runtime} ms</span>
                                <span className="mx-1">•</span>
                                <span>{(sub.memory / 1024).toFixed(1)} MB</span>
                              </div>
                            </td>
                            <td>
                              <span className="text-xs text-base-content/60" title={new Date(sub.createdAt).toLocaleString()}>
                                {new Date(sub.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
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
    </div>
  );
};

export default Profile;
