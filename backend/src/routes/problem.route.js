import express from "express";
import * as problemController from "../controllers/problem.controller.js";
import { authAdmin, authUser } from "../middlewares/auth.middleware.js";

const problemRouter = express.Router();

problemRouter.post(
  "/create",
  authAdmin,
  problemController.createProblem
);
problemRouter.put(
  "/update/:id",
  authAdmin,
  problemController.updateProblem
);
problemRouter.delete("/delete/:id", authAdmin, problemController.deleteProblem);
problemRouter.get("/:id", authAdmin, problemController.getProblemByIdForAdmin);

export default problemRouter;
