import problemModel from "../models/problem.model.js";
import submitModel from "../models/submit.model.js";

export async function getProblemById(req, res) {
  const problemId = req.params.id;
  // Logic to get the problem with the given ID
  res.send(`Get problem with ID: ${problemId}`);
}

export const getAllProblem = async (req, res) => {
  try {
    const getProblem = await problemModel
      .find({})
      .select("_id title difficulty tags");

    if (getProblem.length == 0)
      return res.status(404).send("Problem is Missing");

    res.status(200).send(getProblem);
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
