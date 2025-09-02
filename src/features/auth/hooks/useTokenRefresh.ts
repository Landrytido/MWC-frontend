import { useEffect, useCallback } from "react";
import { authService } from "../services/authService";

export const useTokenRefresh = () => {
  const handleTokenRefresh = useCallback(() => {
    // Force un re-render ou une re-validation des données
    console.log("Token rafraîchi automatiquement");

    // Émettre un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(
      new CustomEvent("tokenRefreshed", {
        detail: { timestamp: Date.now() },
      })
    );
  }, []);

  useEffect(() => {
    // S'abonner aux notifications de rafraîchissement de token
    const unsubscribe = authService.onTokenRefresh(handleTokenRefresh);

    // Nettoyer l'abonnement lors du démontage
    return unsubscribe;
  }, [handleTokenRefresh]);

  // Méthode pour forcer une vérification du token
  const checkTokenStatus = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      // Test simple avec un endpoint qui nécessite l'authentification
      const response = await authService.authenticatedFetch("/auth/verify", {
        method: "GET",
      });

      return response.ok;
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return false;
    }
  }, []);

  return {
    checkTokenStatus,
  };
};
