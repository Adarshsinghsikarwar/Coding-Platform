import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";


const userRouter = express.Router();

userRouter.get("/problemById/:id", authUser, userController.getProblemById);
userRouter.get("/getAllProblem", authUser, userController.getAllProblem);
userRouter.get(
  "/problemSolvedByUser",
  authUser,
  userController.solvedAllProblembyUser
);
userRouter.get(
  "/getSubmission/:id",
  authUser,
  userController.getSubmissionProblem
);
export default userRouter;
