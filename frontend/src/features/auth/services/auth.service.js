import api from "../../../api/apiConfig";

// POST /auth/register
export const registerUser = (data) => {
  return api.post("/auth/register", data);
};

// POST /auth/login
export const loginUser = (data) => {
  return api.post("/auth/login", data);
};

// POST /auth/verify-otp
export const verifyOtp = (data) => {
  return api.post("/auth/verify-otp", data);
};

// POST /auth/resend-otp
export const resendOtp = (data) => {
  return api.post("/auth/resend-otp", data);
};

// GET /auth/me
export const getMe = (accessToken) => {
  return api.get("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
};

// POST /auth/logout
export const logoutUser = () => {
  return api.post("/auth/logout");
};

// POST /auth/refreshToken  (cookie is sent automatically)
export const refreshAccessToken = () => {
  return api.post("/auth/refreshToken");
};

// POST /auth/set-password  (for new Google users)
export const setPassword = (data) => {
  return api.post("/auth/set-password", data);
};

// POST /auth/forgot-password
export const forgotPassword = (data) => {
  return api.post("/auth/forgot-password", data);
};

// POST /auth/reset-password
export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};
