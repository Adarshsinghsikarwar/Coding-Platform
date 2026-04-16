import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  registerUser,
  reportInvalidRegistrationAttempt,
} from "../services/auth.service";
import { setLoading, setError, setOtpEmail } from "../auth.slice";

export function useRegister() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (formData) => {
    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Keep the attempted email so UI can show it even if request fails.
      if (formData?.emailId) {
        dispatch(setOtpEmail(formData.emailId));
      }

      const response = await registerUser(formData);

      // Save email for OTP verification page
      dispatch(setOtpEmail(response.data.email));
      dispatch(setLoading(false));

      // Navigate to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      const responseData = error?.response?.data || {};
      const attemptedEmail =
        responseData?.email ||
        responseData?.emailId ||
        formData?.emailId ||
        null;

      if (attemptedEmail) {
        dispatch(setOtpEmail(attemptedEmail));
      }

      const message =
        responseData?.message === "Server error" && responseData?.error
          ? responseData.error
          : responseData?.message || "Registration failed. Please try again.";
      dispatch(setError(message));

      if (responseData?.requiresOtp === true) {
        navigate("/verify-otp");
      }
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleInvalidRegistrationAttempt = async (emailId, reason) => {
    const attemptedEmail = String(emailId || "").trim();
    if (!attemptedEmail) return;

    try {
      await reportInvalidRegistrationAttempt({
        emailId: attemptedEmail,
        reason: reason || "Invalid email format",
      });
    } catch {
      // Keep UX silent; this is only for admin monitoring.
    }
  };

  return { handleRegister, handleInvalidRegistrationAttempt, isSubmitting };
}
