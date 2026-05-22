import axios from "axios";
import { store } from "../app/app.store";
import { setUser, logout } from "../features/auth/auth.slice";

export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:3000" : window.location.origin);

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // sends the refreshToken cookie automatically
});

// ─────────────────────────────────────────────
// Request Interceptor
// Attach the accessToken from Redux state to every request
// ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// ─────────────────────────────────────────────
// Response Interceptor
// If a request gets a 401 (token expired), try to refresh the token.
// If refresh works → update state → retry the original request.
// If refresh fails → logout the user → redirect to login.
// ─────────────────────────────────────────────

// Flag to prevent multiple refresh calls at the same time
let isRefreshing = false;

api.interceptors.response.use(
  // If the response is successful, just return it
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh if:
    // 1. It's a 401 error
    // 2. We haven't already retried this request
    // 3. It's not the refreshToken endpoint itself (to avoid infinite loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refreshToken")
    ) {
      // If another request is already refreshing, just reject
      if (isRefreshing) {
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to get a new access token using the refresh token cookie
        const response = await api.post("/auth/refreshToken");
        const newAccessToken = response.data.accessToken;

        // Update the access token in Redux state
        const currentUser = store.getState().auth.user;
        store.dispatch(setUser({ user: currentUser, accessToken: newAccessToken }));

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token also failed (expired or invalid) → force logout
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;