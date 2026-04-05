import express from "express";
import * as problemController from "../controllers/problem.controller.js";
import { authAdmin, authUser } from "../middlewares/auth.middleware.js";
import { createProblemValidator } from "../validators/problem.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const problemRouter = express.Router();

problemRouter.get("/", authUser, problemController.getAllProblems);
problemRouter.get(
  "/solved",
  authUser,
  problemController.getAllSolvedProblemsByUser
);
problemRouter.get("/:id", authUser, problemController.getProblemById);
problemRouter.post(
  "/create",
  authAdmin,
  createProblemValidator,
  validate,
  problemController.createProblem
);
problemRouter.patch(
  "/:id",
  authAdmin,
  createProblemValidator,
  validate,
  problemController.updateProblem
);
problemRouter.delete("/:id", authAdmin, problemController.deleteProblem);

export default problemRouter;
