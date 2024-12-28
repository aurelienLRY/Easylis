
/**
 * Interface for a session
 * @property {string} _id - The id of the session
 * @property {string} status - The status of the session
 * @property {Date} date - The date of the session
 * @property {string} startTime - The start time of the session
 * @property {string} endTime - The end time of the session
 * @property {string} activity - The activity of the session
 * @property {string} spot - The spot of the session
 * @property {number} placesMax - The maximum number of people for the session
 * @property {number} placesReserved - The number of people reserved for the session
 */
export interface ISession {
    _id: string;
    status: "Actif"| "Pending" | "Archived";
    date: Date;
    startTime: string;
    endTime: string;
    activity: string;
    spot: string;
    placesMax: number;
    placesReserved: number;
    type_formule: "half_day" | "full_day";
    duration?: string;
  }