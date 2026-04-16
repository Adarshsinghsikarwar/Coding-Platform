import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe, refreshAccessToken } from "../services/auth.service";
import { logout, setUser, setLoading } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, accessToken, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    const bootstrapAuth = async () => {
      // If user is already hydrated in store, nothing to do.
      if (user && accessToken) return;

      try {
        dispatch(setLoading(true));

        const url = new URL(window.location.href);
        const tokenFromUrl = url.searchParams.get("accessToken");

        if (tokenFromUrl) {
          const meResponse = await getMe(tokenFromUrl);
          dispatch(
            setUser({
              user: meResponse.data.user,
              accessToken: tokenFromUrl,
            })
          );

          url.searchParams.delete("accessToken");
          window.history.replaceState({}, "", url.toString());
          return;
        }

        if (accessToken) {
          const meResponse = await getMe(accessToken);
          dispatch(
            setUser({
              user: meResponse.data.user,
              accessToken,
            })
          );
          return;
        }

        const refreshResponse = await refreshAccessToken();
        const nextAccessToken = refreshResponse.data?.accessToken;

        if (!nextAccessToken) {
          dispatch(logout());
          return;
        }

        const meResponse = await getMe(nextAccessToken);
        dispatch(
          setUser({
            user: meResponse.data.user,
            accessToken: nextAccessToken,
          })
        );
      } catch {
        // No active session is a valid state, so keep this silent.
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    bootstrapAuth();
  }, [accessToken, dispatch, user]);

  return { user, isLoading, accessToken };
}
