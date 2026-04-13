import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { forgotPassword } from "../services/auth.service";

const ForgotPassword = () => {
  const [emailId, setEmailId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailId) {
      setError("Please enter your email");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg("");

      await forgotPassword({ emailId });

      setSuccessMsg("OTP sent. Redirecting...");
      setTimeout(() => {
        // Option to pass emailId through state
        navigate("/reset-password", { state: { emailId } });
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <h2 className="card-title text-2xl font-bold justify-center mb-2">
            Forgot Password
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Enter your email to receive a password reset OTP
          </p>

          {/* Success Message */}
          {successMsg && (
            <div className="alert alert-success mb-4">
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <p className="text-center mt-6">
            Remembered your password?{" "}
            <Link to="/login" className="link link-primary font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
