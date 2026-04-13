import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { getMe } from "../services/auth.service";
import { setUser, setLoading } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, isLoading } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if there's an accessToken in the URL (from Google OAuth redirect)
    const tokenFromUrl = searchParams.get("accessToken");

    if (tokenFromUrl) {
      // Remove the token from the URL for security
      searchParams.delete("accessToken");
      setSearchParams(searchParams, { replace: true });

      // Fetch user data with the token
      fetchUser(tokenFromUrl);
      return;
    }

    // If we already have a token in state, fetch user data
    if (accessToken && !user) {
      fetchUser(accessToken);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      dispatch(setLoading(true));
      const response = await getMe(token);
      dispatch(
        setUser({
          user: response.data.user,
          accessToken: token,
        })
      );
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { user, isLoading, accessToken };
}
