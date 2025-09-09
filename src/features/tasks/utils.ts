/**
 * Utilitaires pour la gestion des dates des tâches
 */

/**
 * Obtient la date locale au format YYYY-MM-DD
 * @returns Date locale "2024-01-16"
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Obtient la date de demain au format YYYY-MM-DD
 * @returns Date de demain "2024-01-17"
 */
export const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Convertit une date au format YYYY-MM-DD en DateTime à 23:59
 * @param dateString Date au format "2024-01-16"
 * @returns DateTime au format "2024-01-16T23:59:00"
 */
export const convertDateToEndOfDay = (dateString: string): string => {
  if (!dateString) return "";

  // Si c'est déjà un DateTime complet, on l'extrait d'abord
  const dateOnly = dateString.split("T")[0];

  return `${dateOnly}T23:59:00`;
};

/**
 * Convertit un DateTime en date uniquement
 * @param dateTimeString DateTime au format "2024-01-16T09:00:00"
 * @returns Date au format "2024-01-16"
 */
export const extractDateOnly = (dateTimeString: string): string => {
  if (!dateTimeString) return "";
  return dateTimeString.split("T")[0];
};

/**
 * Formate une date pour l'affichage (sans heure)
 * @param dateString Date ou DateTime
 * @returns Date formatée "16 janvier 2024"
 */
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Vérifie si une date est dans le passé (en ignorant l'heure)
 * @param dateString Date au format "2024-01-16"
 * @returns true si la date est antérieure à aujourd'hui
 */
export const isDateInPast = (dateString: string): boolean => {
  if (!dateString) return false;

  const todayString = getTodayDateString();
  return dateString < todayString;
};
