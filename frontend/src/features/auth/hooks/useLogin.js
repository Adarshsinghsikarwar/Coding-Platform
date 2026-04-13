import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../services/auth.service";
import { setUser, setLoading, setError } from "../auth.slice";

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (formData) => {
    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await loginUser(formData);

      // Save user and token in state
      dispatch(
        setUser({
          user: response.data.user,
          accessToken: response.data.accessToken,
        })
      );

      // Navigate to home page
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      dispatch(setError(message));

      // If user is not verified, redirect to OTP page
      if (error.response?.status === 403 && error.response?.data?.email) {
        const { setOtpEmail } = await import("../auth.slice");
        dispatch(setOtpEmail(error.response.data.email));
        navigate("/verify-otp");
      }
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return { handleLogin, isSubmitting };
}
