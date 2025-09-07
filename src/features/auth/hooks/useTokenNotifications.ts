import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

interface TokenNotificationState {
  show: boolean;
  message: string;
  type: "success" | "warning" | "error";
}

export const useTokenNotifications = () => {
  const [notification, setNotification] = useState<TokenNotificationState>({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = useCallback(
    (message: string, type: "success" | "warning" | "error") => {
      setNotification({
        show: true,
        message,
        type,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const handleTokenRefreshed = () => {
      showNotification("Session rafraîchie automatiquement", "success");
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden && authService.isAuthenticated()) {
        try {
          const token = authService.getToken();
          if (token) {
            await authService.authenticatedFetch("/auth/verify");
          }
        } catch {
          showNotification(
            "Session expirée, veuillez vous reconnecter",
            "error"
          );
        }
      }
    };

    const handleFocus = () => {
      if (authService.isAuthenticated()) {
        handleVisibilityChange();
      }
    };

    window.addEventListener("tokenRefreshed", handleTokenRefreshed);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("tokenRefreshed", handleTokenRefreshed);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
