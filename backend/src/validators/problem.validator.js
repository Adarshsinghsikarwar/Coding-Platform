import { body } from "express-validator";

export const createProblemValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("difficulty")
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Invalid difficulty level"),
  body("tags").isArray().withMessage("Tags must be an array"),
  body("visibleTestCases")
    .isArray()
    .withMessage("Visible test cases must be an array"),
  body("hiddenTestCases")
    .isArray()
    .withMessage("Hidden test cases must be an array"),
  body("startCode").isArray().withMessage("Start code must be an array"),
  body("referenceSolution")
    .isArray()
    .withMessage("Reference solution must be an array"),
];
  