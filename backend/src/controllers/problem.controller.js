import mongoose from "mongoose";
import problemModel from "../models/problem.model.js";
import {
  normalizeTags,
  validateReferenceSolutions,
} from "../services/problemValidation.service.js";

export async function createProblem(req, res) {
  try {
    const { visibleTestCases, referenceSolution } = req.body;

    await validateReferenceSolutions(visibleTestCases, referenceSolution);

    const problem = new problemModel({
      ...req.body,
      tags: normalizeTags(req.body.tags),
      problemCreator: req.user.id,
    });

    await problem.save();
    return res.status(201).json({
      message: "Problem created successfully",
      problem,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json(err.payload);
    }

    console.error("Error occurred while creating problem:", err);
    const apiMessage = err?.response?.data || err?.message;
    return res.status(500).json({
      message: "Server error while validating reference solution",
      error: apiMessage,
    });
  }
}

export async function updateProblem(req, res) {
  try {
    const { id } = req.params;
    const { visibleTestCases, referenceSolution } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Missing ID Field" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const existingProblem = await problemModel.findById(id);
    if (!existingProblem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await validateReferenceSolutions(visibleTestCases, referenceSolution);

    const payload = {
      ...req.body,
      problemCreator: existingProblem.problemCreator,
      tags: normalizeTags(req.body.tags),
    };

    const updatedProblem = await problemModel.findByIdAndUpdate(id, payload, {
      runValidators: true,
      new: true,
    });

    return res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json(err.payload);
    }

    console.error("Error occurred while updating problem:", err);
    const apiMessage = err?.response?.data || err?.message;
    return res.status(500).json({
      message: "Server error while validating reference solution",
      error: apiMessage,
    });
  }
}

export async function deleteProblem(req, res) {
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("ID is Missing");

    const deletedProblem = await problemModel.findByIdAndDelete(id);

    if (!deletedProblem) return res.status(404).send("Problem is Missing");

    res.status(200).send("Successfully Deleted");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
}

export async function getProblemByIdForAdmin(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Missing ID Field" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const problem = await problemModel.findById(id).lean();

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
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
