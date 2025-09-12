import { useEffect, useCallback } from "react";
import { authService } from "../services/authService";

export const useTokenRefresh = () => {
  const handleTokenRefresh = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("tokenRefreshed", {
        detail: { timestamp: Date.now() },
      })
    );
  }, []);

  useEffect(() => {
    const unsubscribe = authService.onTokenRefresh(handleTokenRefresh);

    return unsubscribe;
  }, [handleTokenRefresh]);

  const checkTokenStatus = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      const response = await authService.authenticatedFetch("/auth/verify", {
        method: "GET",
      });

      return response.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    checkTokenStatus,
  };
};
