/**
 * Interface for a user
 * @property {string} _id - The id of the user
 * @property {string} name - The name of the user
 * @property {string} email - The email of the user
 * @property {string} password - The password of the user
 */
export interface IUser {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  password?: string;
  avatar?: string;
  calendar?: boolean;
  tokenCalendar: string | null;
  tokenRefreshCalendar: string | null;
  phone?: string;
}
