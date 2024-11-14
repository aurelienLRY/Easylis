import * as yup from "yup";



export const emailSchema = yup.object().shape({
    scenario: yup.string().required("Le champ scenario est requis"),
    subject: yup.string().required("Le champ subject est requis"),
    body: yup.string().required("Le champ body est requis"),
});