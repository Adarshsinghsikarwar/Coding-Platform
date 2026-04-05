import express from "express";
import * as problemController from "../controllers/problem.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const problemRouter = express.Router();

problemRouter.post("/create", authAdmin, problemController.createProblem);
problemRouter.patch("/:id", authAdmin, problemController.updateProblem);
problemRouter.delete("/:id", authAdmin, problemController.deleteProblem);


problemRouter.get("/:id", problemController.getProblemById);
problemRouter.get("/", problemController.getAllProblems);
problemRouter.get(
  "/solvedProblems",
  problemController.getAllSolvedProblemsByUser
);

export default problemRouter;
