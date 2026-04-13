import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { setPassword as setPasswordService } from "../services/auth.service";
import { setUser, setLoading, setError } from "../auth.slice";

export function useSetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read the temp token from the URL (?token=...)
  const token = searchParams.get("token");

  const handleSetPassword = async (password) => {
    if (!token) {
      dispatch(setError("Invalid or missing token. Please sign in with Google again."));
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await setPasswordService({ token, password });

      // Save user and token in state — user is now logged in
      dispatch(
        setUser({
          user: response.data.user,
          accessToken: response.data.accessToken,
        })
      );

      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to set password. Please try again.";
      dispatch(setError(message));
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return { handleSetPassword, isSubmitting, token };
}
