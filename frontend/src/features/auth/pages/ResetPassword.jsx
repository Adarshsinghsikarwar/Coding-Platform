import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { resetPassword } from "../services/auth.service";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [emailId, setEmailId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.state?.emailId) {
      setEmailId(location.state.emailId);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailId || !otp || !newPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    // Add simple frontend validation for password matching backend criteria (e.g. at least 8 chars)
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMsg("");

      await resetPassword({ emailId, otp, newPassword });

      setSuccessMsg("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
            Reset Password
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Enter the OTP sent to your email and your new password
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

          {/* Form */}
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
                readOnly={!!location.state?.emailId}
              />
            </div>

            {/* OTP */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">OTP Code</span>
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="input input-bordered w-full pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
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
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <p className="text-center mt-6">
            <Link to="/login" className="link link-primary font-medium">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
