/**
 * Interface for an activity
 * @property {string} _id - The id of the activity
 * @property {string} name - The name of the activity
 * @property {string} description - The description of the activity
 * @property {boolean} half_day - The half day availability of the activity
 * @property {boolean} full_day - The full day availability of the activity
 * @property {number} price_half_day - The price of the activity for a half day
 * @property {number} price_full_day - The price of the activity for a full day
 * @property {number} min_age - The minimum age for the activity
 * @property {number} max_OfPeople - The maximum number of people for the activity
 */
export interface IActivity {
  _id?: string;
  name: string;
  description: string | null;
  half_day: boolean;
  full_day: boolean;
  price_half_day: {
    standard: number;
    reduced: number;
    ACM: number;
  };
  price_full_day: {
    standard: number;
    reduced: number;
    ACM: number;
  };
  min_age: number;
  max_OfPeople: number;
  min_OfPeople: number;
  duration: {
    half: string | null;
    full: string | null;
  };
  required_equipment: string | null;
}
