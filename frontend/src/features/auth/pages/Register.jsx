import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { useRegister } from "../hooks/useRegister";
import { API_BASE } from "../../../api/apiConfig";

const registerSchema = z.object({
  firstName: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().optional(),
  emailId: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
    .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
    .regex(/[0-9]/, "Must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character"),
});

const Register = () => {
  const { handleRegister, handleInvalidRegistrationAttempt, isSubmitting } =
    useRegister();
  const { error, otpEmail } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data) => {
    handleRegister(data);
  };

  const onInvalidSubmit = async (formErrors) => {
    if (!formErrors?.emailId) return;

    const attemptedEmail = getValues("emailId");
    await handleInvalidRegistrationAttempt(
      attemptedEmail,
      formErrors.emailId.message
    );
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <h2 className="card-title text-2xl font-bold text-center justify-center mb-2">
            Create Account
          </h2>
          <p className="text-center text-base-content/60 mb-6">
            Sign up to get started
          </p>

          {error && otpEmail && (
            <p className="text-center text-sm text-base-content/70 mb-4">
              Attempted email: <span className="font-semibold">{otpEmail}</span>
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Register Form */}
          <form
            onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
            className="space-y-4"
          >
            {/* First Name & Last Name */}
            <div className="flex gap-3">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium">First Name</span>
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="John"
                  className={`input input-bordered w-full ${
                    errors.firstName ? "input-error" : ""
                  }`}
                />
                {errors.firstName && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.firstName.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text font-medium">Last Name</span>
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Doe"
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                {...register("emailId")}
                placeholder="you@example.com"
                className={`input input-bordered w-full ${
                  errors.emailId ? "input-error" : ""
                }`}
              />
              {errors.emailId && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.emailId.message}
                  </span>
                </label>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a strong password"
                  className={`input input-bordered w-full pr-11 ${
                    errors.password ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password.message}
                  </span>
                </label>
              )}
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
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Google Signup */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="btn btn-outline w-full gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Login Link */}
          <p className="text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
