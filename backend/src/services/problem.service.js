import problemModel from "../models/problem.model.js";
import submitModel from "../models/submit.model.js";

export async function fetchAllProblems(filters) {
  const { userId, status, difficulty, tag } = filters;

  const mongoFilter = {};

  if (difficulty && difficulty !== "all") {
    mongoFilter.difficulty = difficulty;
  }

  if (tag && tag !== "all") {
    mongoFilter.tags = tag;
  }

  const problems = await problemModel
    .find(mongoFilter)
    .select("_id title difficulty tags")
    .sort({ title: 1 });

  const solvedProblemIds = await submitModel.distinct("problemId", {
    userId,
    status: "accepted",
  });

  const solvedSet = new Set(solvedProblemIds.map((id) => String(id)));

  const problemsWithStatus = problems.map((problem) => {
    const isSolved = solvedSet.has(String(problem._id));

    return {
      _id: problem._id,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      status: isSolved ? "solved" : "unsolved",
    };
  });

  if (status && status !== "all") {
    return problemsWithStatus.filter((problem) => problem.status === status);
  }

  return problemsWithStatus;
}
