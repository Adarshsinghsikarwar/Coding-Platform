import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";
import { store } from "./app/app.store";
import router from "./app/app.route";
import { useAuth } from "./features/auth/hooks/useAuth";
import "./app/App.css";

const AuthBootstrap = () => {
  useAuth();
  return null;
};

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthBootstrap />
    <RouterProvider router={router} />
  </Provider>
);
