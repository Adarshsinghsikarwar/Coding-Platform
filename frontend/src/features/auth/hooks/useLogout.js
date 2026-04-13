import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logoutUser } from "../services/auth.service";
import { logout as logoutAction } from "../auth.slice";

export function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state even if API call fails
      dispatch(logoutAction());
      navigate("/login");
    }
  };

  return { handleLogout };
}
