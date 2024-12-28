import * as yup from "yup";

/**
 * Activity Schema
 * @returns Activity Schema
 */
export const activitySchema = yup.object().shape(
  {
    name: yup.string().required("Le champ name est requis"),
    description: yup.string().nullable(),
    half_day: yup.boolean(),
    full_day: yup.boolean(),

    price_half_day: yup.object().when("half_day", {
      is: true,
      then: (schema) =>
        schema.shape({
          standard: yup
            .number()
            .positive()
            .integer()
            .required("Le prix pour la demi-journée est requis"),
          reduced: yup.number().integer().nullable(),
          ACM: yup.number().integer().nullable(),
        }),
      otherwise: (schema) => schema,
    }),

    price_full_day: yup.object().when("full_day", {
      is: true,
      then: (schema) =>
        schema.shape({
          standard: yup
            .number()
            .positive()
            .integer()
            .required("Le prix pour la journée complète est requis"),
          reduced: yup.number().integer().nullable(),
          ACM: yup.number().integer().nullable(),
        }),
      otherwise: (schema) => schema,
    }),

    min_age: yup
      .number()
      .positive()
      .integer()
      .required("Le champ min_age est requis"),
    max_OfPeople: yup
      .number()
      .positive()
      .integer()
      .required("Le champ max_OfPeople est requis"),
    min_OfPeople: yup
      .number()
      .positive()
      .integer()
      .required("Le champ min_OfPeople est requis"),

    required_equipment: yup.string().nullable(),

    duration: yup.object({
      half: yup.string().when("half_day", {
        is: true,
        then: (schema) => schema.required("Le champ duration est requis"),
        otherwise: (schema) => schema.nullable(),
      }),
      full: yup.string().when("full_day", {
        is: true,
        then: (schema) => schema.required("Le champ duration est requis"),
        otherwise: (schema) => schema.nullable(),
      }),
    }),
  },
  [["half_day", "full_day"]]
);
