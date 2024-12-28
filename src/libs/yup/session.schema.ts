import * as yup from "yup";

/**
 * Session Schema
 * @returns Session Schema
 */
export const sessionSchema = yup.object().shape({
    status: yup.string().required("Le champ status est requis"),
    date: yup.date().typeError("Renseignez une date valide").required("Le champ date est requis"),
    startTime: yup.string().typeError("Renseignez une heure valide").required("Le champ heure de début est requis"),
    endTime: yup.string().typeError("Renseignez une heure valide").required("Le champ heure de fin est requis"),
    activity: yup.string().required("Sélectionnez une activité"),
    spot: yup.string().required("Sélectionnez un lieu"),
    placesMax: yup
      .number()
      .typeError("le nombre de place maximum est requis")
      .required("le nombre de place maximum est requis")
      .positive()
      .integer(),
    placesReserved: yup
      .number()
      .typeError("le nombre de place réservé est requis")
      .required("le nombre de place réservé est requis")
      .integer().default(0),
    type_formule: yup.string().required("Renseignez la formule"),
    duration: yup.string().required("Renseignez la durée de la séance"),
  });

