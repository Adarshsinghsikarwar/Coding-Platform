import { body } from "express-validator";
import { validate } from "../middlewares/validate.middleware.js";

export const validateRegistration = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isString()
    .isLength({ min: 2, max: 20 }),

  body("emailId")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol"
    ),

  body("age").optional().isInt({ min: 5, max: 80 }),

  body("role").not().exists(), // prevent admin injection
  validate,
];

export const validateLogin = [
  body("emailId")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol"
    ),
  validate,
];
