import { createBrowserRouter } from "react-router";
import Home from "../features/Problem/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import VerifyOtp from "../features/auth/pages/VerifyOtp";
import SetPassword from "../features/auth/pages/SetPassword";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/verify-otp",
    element: <VerifyOtp />,
  },
  {
    path: "/set-password",
    element: <SetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]);

export default router;
