import express from "express";
import * as submitController from "../controllers/submit.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const submissionRouter = express.Router();

submissionRouter.post("/submit/:id", authUser, submitController.submitCode);
submissionRouter.post("/run/:id", authUser, submitController.runCode);

export default submissionRouter;
