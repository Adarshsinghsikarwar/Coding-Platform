import express from "express";
import * as problemController from "../controllers/problem.controller.js";
import { authAdmin } from "../middlewares/auth.middleware.js";

const problemRouter = express.Router();

problemRouter.post("/create", authAdmin, problemController.createProblem);
problemRouter.patch("/:id", authAdmin, problemController.updateProblem);
problemRouter.delete("/:id", authAdmin, problemController.deleteProblem);


export default problemRouter;
