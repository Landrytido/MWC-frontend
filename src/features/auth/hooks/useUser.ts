import { useState, useCallback } from "react";
import { User } from "../types";
import { httpService } from "../../../shared/services/httpService";

interface UseUserReturn {
  loading: boolean;
  error: string | null;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
  }) => Promise<User>;
  getProfile: () => Promise<User>;
}

export const useUser = (): UseUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (data: { firstName?: string; lastName?: string }): Promise<User> => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await httpService.put<User>("/users/profile", data);
        return updatedUser;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProfile = useCallback(async (): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      const user = await httpService.get<User>("/users/profile");
      return user;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur lors de la récupération";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateProfile,
    getProfile,
  };
};
