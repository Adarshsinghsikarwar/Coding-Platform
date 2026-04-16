import problemModel from "../models/problem.model.js";
import submitModel from "../models/submit.model.js";
import { fetchAllProblems } from "../services/problem.service.js";

export async function getProblemById(req, res) {
  try {
    const problemId = req.params.id;

    const problem = await problemModel
      .findById(problemId)
      .select("-hiddenTestCases")
      .lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    return res.status(200).json({
      success: true,
      problem,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching problem",
    });
  }
}

export const getAllProblem = async (req, res) => {
  try {
    const { status, difficulty, tag } = req.query;

    const getProblem = await fetchAllProblems({
      userId: req.user._id,
      status,
      difficulty,
      tag,
    });

    if (getProblem.length === 0) {
      return res.status(200).json({
        success: true,
        getProblem: [],
      });
    }

    res.status(200).json({
      success: true,
      getProblem,
    });
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

export const solvedAllProblembyUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const solvedProblemIds = await submitModel.distinct("problemId", {
      userId,
      status: "accepted",
    });

    if (solvedProblemIds.length === 0) {
      return res.status(200).send([]);
    }

    const solvedProblems = await problemModel
      .find({ _id: { $in: solvedProblemIds } })
      .select("_id title difficulty tags");

    res.status(200).send(solvedProblems);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

export const getSubmissionProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.id;

    const ans = await submitModel.find({ userId, problemId });

    if (ans.length == 0) return res.status(404).send("No submission found");

    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
