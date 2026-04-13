import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../services/auth.service";
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

      const response = await registerUser(formData);

      // Save email for OTP verification page
      dispatch(setOtpEmail(response.data.email));
      dispatch(setLoading(false));

      // Navigate to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      dispatch(setError(message));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return { handleRegister, isSubmitting };
}
