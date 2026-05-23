import { createBrowserRouter, Navigate } from "react-router";
import Home from "../features/Problem/pages/Home";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import SetPassword from "../features/auth/pages/SetPassword";
import CreateProblem from "../features/Problem/pages/CreateProblem";
import Admin from "../features/Problem/pages/Admin";
import ProblemPage from "../features/user/pages/ProblemPage";
import Profile from "../features/user/pages/Profile";

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
    path: "/admin/create-problem",
    element: <CreateProblem />,
  },
  {
    path: "/admin/problems",
    element: <Admin />,
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
    path: "/set-password",
    element: <SetPassword />,
  },
  {
    path: "/problem/:problemId",
    element: <ProblemPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
