import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { useVerifyOtp } from "../hooks/useVerifyOtp";

const VerifyOtp = () => {
  const { handleVerifyOtp, handleResendOtp, isSubmitting, cooldown, otpEmail } =
    useVerifyOtp();
  const { error } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState("");

  // If no email is stored, redirect to register
  if (!otpEmail) {
    return <Navigate to="/register" replace />;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      handleVerifyOtp(otp);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          {/* Header */}
          <h2 className="card-title text-2xl font-bold mb-2">
            Verify Your Email
          </h2>
          <p className="text-base-content/60 mb-2">
            We&apos;ve sent a 6-digit code to
          </p>
          <p className="font-semibold text-primary mb-6">{otpEmail}</p>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error w-full mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={onSubmit} className="w-full space-y-4">
            <div className="form-control">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  // Only allow digits, max 6 characters
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                placeholder="Enter 6-digit OTP"
                className="input input-bordered w-full text-center text-xl tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting || otp.length !== 6}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-4">
            <p className="text-sm text-base-content/60 mb-2">
              Didn&apos;t receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              className="btn btn-ghost btn-sm"
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
