import * as yup from "yup";




/**
* CustomerSession Schema
* @returns CustomerSession Schema
*/
export const customerSessionSchema = yup.object().shape({
 sessionId: yup.string().required("Le champ sessionId est requis"),
 date: yup.date().required("Le champ date est requis"),
 status: yup
   .string()
   .required("Le champ status est requis")
   .oneOf(["Validated", "Canceled", "Waiting"]),
 typeOfReservation: yup
   .string()
   .required("Le champ typeOfReservation est requis"),
 number_of_people: yup
   .number()
   .required("Le champ number_of_people est requis"),
 last_name: yup.string().required("Le champ last_name est requis"),
 first_names: yup.string().required("Le champ first_names est requis"),
 email: yup
   .string()
   .email("L'email est invalide")
   .required("Le champ email est requis"),
 phone: yup.string().required("Le champ phone est requis"),
 people_list: yup.array().of(
   yup.object().shape({
     size: yup.string().required("Le champ size est requis"),
     weight: yup.string().required("Le champ weight est requis"),
     price_applicable: yup.number().required("Le champ price_applicable est requis"),
     isReduced: yup.boolean(),
   })
 ),
 tarification: yup
   .string()
   .required("Le champ tarification est requis")
   .oneOf(["reduced", "standard", "acm"]),
 price_applicable: yup.number().required("Le champ price_applicable est requis"),
 price_total: yup.number().required("Le champ price_total est requis"),
});