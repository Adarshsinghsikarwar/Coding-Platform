import express from "express";
import * as problemController from "../controllers/problem.controller.js";
import { authAdmin, authUser } from "../middlewares/auth.middleware.js";
import { createProblemValidator } from "../validators/problem.validator.js";

const problemRouter = express.Router();

problemRouter.post(
  "/create",
  authAdmin,
  // createProblemValidator,

  problemController.createProblem
);
problemRouter.put(
  "/update/:id",
  authAdmin,
  //createProblemValidator,
  problemController.updateProblem
);
problemRouter.delete("/delete/:id", authAdmin, problemController.deleteProblem);
problemRouter.get

export default problemRouter;
