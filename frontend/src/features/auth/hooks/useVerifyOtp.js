import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { verifyOtp, resendOtp } from "../services/auth.service";
import { setUser, setLoading, setError } from "../auth.slice";

export function useVerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { otpEmail } = useSelector((state) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle OTP verification
  const handleVerifyOtp = async (otp) => {
    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await verifyOtp({ email: otpEmail, otp });

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
        error.response?.data?.message || "OTP verification failed. Please try again.";
      dispatch(setError(message));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  // Handle resend OTP with cooldown timer
  const handleResendOtp = async () => {
    try {
      dispatch(setError(null));

      await resendOtp({ email: otpEmail });

      // Start 60 second cooldown
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to resend OTP.";
      dispatch(setError(message));
    }
  };

  return {
    handleVerifyOtp,
    handleResendOtp,
    isSubmitting,
    cooldown,
    otpEmail,
  };
}
