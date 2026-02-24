import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";
import { authApi } from "../api/auth.api";

export const useAuthInit = () => {
  const { setAuth, clearAuth, setInitializing } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authApi.refresh();
        const { user, tokens } = res;
        setAuth(user, tokens.accessToken);
      } catch (error) {
        clearAuth();
      } finally {
        setInitializing(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setInitializing]);
};
