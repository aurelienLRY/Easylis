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
 * Format the date and time to YYYY-MM-DDTHH:MM:SS+00:00
 * @param date - The date to format
 * @param hours - The hours to format
 * @param timeZone - The time zone to format
 * @returns The formatted date and time
 */
export const formatDateTime = (
  date: string | Date,
  hours: string,
  timeZone: string = "+01:00"
) => {
  const d = new Date(date);
  return `${formatDate(d)}T${hours}:00${timeZone}`;
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
