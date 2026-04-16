import { validationResult } from "express-validator";
import { sendWrongEmailRegistrationAlert } from "../services/registrationAlert.service.js";

export const validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const isRegisterRoute = req.originalUrl?.includes("/auth/register");

    const hasInvalidEmailError = errorList.some(
      (error) =>
        error.path === "emailId" && String(error.msg).includes("Invalid email")
    );

    if (isRegisterRoute && hasInvalidEmailError) {
      const attemptedEmail = req.body?.emailId || "(missing)";

      const alertResult = await sendWrongEmailRegistrationAlert({
        attemptedEmail,
        reason: "Invalid email",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        source: "backend-validation",
      });

      if (!alertResult?.ok) {
        console.warn(
          "Admin registration alert was not sent:",
          alertResult?.error || "Unknown reason"
        );
      }
    }

    return res.status(400).json({
      message: errorList[0]?.msg || "Validation failed",
      errors: errorList,
      email: req.body?.emailId || null,
    });
  }
  next();
};
