import { toZonedTime } from "date-fns-tz";
import { formatISO } from "date-fns";

/**
 * Retourne le mois en cours en string
 * @returns {string} Le mois en cours en string
 */
export const getMonthString = () => {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const month = new Date().getMonth();
  return months[month];
};

/**
 * Retourne le mois en cours en string
 * @returns {string} Le mois en cours en string
 */
export const getMonthValue = (month: number) => {
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  return months[month];
};

/**
 * Retourne l'année en cours en string
 * @returns {string} L'année en cours en string
 */
export const getYearString = () => {
  const year = new Date().getFullYear();
  return year.toString();
};

/**
 * Format the date to YYYY-MM-DD
 * @param date - The date to format
 * @returns The formatted date
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formate une date et une heure en format ISO 8601 UTC pour Google Calendar
 * @param date - Date (string ou Date)
 * @param hours - Heure au format "HH:MM"
 * @param timeZone - Fuseau horaire (défaut: "Europe/Paris")
 * @returns Date/heure au format ISO 8601 UTC
 */
export const formatDateTime = (
  date: string | Date,
  hours: string,
  timeZone: string = "Europe/Paris"
): string => {
  const [hour, minute = "00"] = hours.split(":");
  const d = new Date(date);
  
  // Créer une date avec l'heure spécifiée
  d.setHours(Number(hour), Number(minute), 0, 0);
  
  // Convertir en UTC en utilisant le fuseau horaire spécifié
  const utcDate = toZonedTime(d, timeZone);
  
  // Retourner au format ISO 8601
  return formatISO(utcDate);
};

/**
 * Format the date to the locale date string
 * @param date - The date to format
 * @returns The formatted date
 */
export const formatDateToLocaleDateString = (date: string | Date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
