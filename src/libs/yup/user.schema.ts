import * as yup from "yup";

/**
 * User Schema
 * @returns User Schema
 */
export const userSchema = yup.object().shape({
  _id: yup.string(),
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string().email("Invalid email").required("L'email est requis"),
  phone: yup.string(),
  password: yup.string(),
  username: yup.string().required("Le nom d'utilisateur est requis"),
  avatar: yup.string().default("/img/default-avatar.webp"),
  calendar: yup.boolean(),
  tokenCalendar: yup.string().nullable(),
  tokenRefreshCalendar: yup.string().nullable(),
});
