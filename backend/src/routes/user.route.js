import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/:id", authUser, userController.getProblemById);
userRouter.get("/", authUser, userController.getAllProblems);
userRouter.get(
  "/solvedProblems",
  authUser,
  userController.getAllSolvedProblemsByUser
);
export default userRouter;
