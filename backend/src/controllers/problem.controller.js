import mongoose from "mongoose";
import problemModel from "../models/problem.model.js";

export async function createProblem(req, res) {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
    } = req.body;

    const problem = await problemModel.create({
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      hiddenTestCases,
      startCode,
      referenceSolution,
      problemCreator: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Problem created successfully", problem });
  } catch (err) {
    console.error("Error occurred while creating problem:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllProblems(req, res) {
  try {
    const problems = await problemModel
      .find()
      .populate("problemCreator", "firstName lastName emailId")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ message: "Problems retrieved successfully", problems });
  } catch (err) {
    console.error("Error occurred while fetching problems:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getProblemById(req, res) {
  try {
    const problemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const problem = await problemModel
      .findById(problemId)
      .populate("problemCreator", "firstName lastName emailId");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res
      .status(200)
      .json({ message: "Problem retrieved successfully", problem });
  } catch (err) {
    console.error("Error occurred while fetching problem:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAllSolvedProblemsByUser(req, res) {
  try {
    const solvedProblemIds = req.user.problemSolved || [];

    const problems = await problemModel
      .find({ _id: { $in: solvedProblemIds } })
      .populate("problemCreator", "firstName lastName emailId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Solved problems retrieved successfully",
      count: problems.length,
      problems,
    });
  } catch (err) {
    console.error("Error occurred while fetching solved problems:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function updateProblem(req, res) {
  try {
    const problemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const updatedProblem = await problemModel.findByIdAndUpdate(
      problemId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res
      .status(200)
      .json({
        message: "Problem updated successfully",
        problem: updatedProblem,
      });
  } catch (err) {
    console.error("Error occurred while updating problem:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteProblem(req, res) {
  try {
    const problemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const deletedProblem = await problemModel.findByIdAndDelete(problemId);
    if (!deletedProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    return res.status(200).json({ message: "Problem deleted successfully" });
  } catch (err) {
    console.error("Error occurred while deleting problem:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
