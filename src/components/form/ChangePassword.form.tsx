/* libraries */
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Spin } from "antd";

/* components */
import { Input, SecondaryButton, ItemCard, ToasterAction } from "@/components";


type Props = {};

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

 const schema = yup.object({
  password: yup
    .string()
    .required("Le mot de passe est requis")
    .matches(
      passwordRules,
      "Le mot de passe doit contenir au moins 5 caractères, une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("La confirmation du mot de passe est requise"),
});

export const ChangePassword = (props: Props) => {
  const methods = useForm<yup.InferType<typeof schema>>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    console.log("onSubmit password", data);
    const fetchPassword = await fetch("/api/user", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    const result = await fetchPassword.json();
    ToasterAction({ result, defaultMessage: "Mot de passe modifié" });
    if (result.success) {
      methods.reset();
    }
  };

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  return (
    <ItemCard className=" w-full min-w-[300px] min-h-[200px] flex flex-col flex-1 items-center">
      <h3 className="text-2xl font-bold">Changer de mot de passe</h3>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="h-full flex flex-col gap-4 justify-around "
        >
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              name="password"
              label="Mot de passe"
              className="max-w-[250px]"
              wIsRaw={false}
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirmer le mot de passe"
              className="max-w-[250px]"
              wIsRaw={false}
            />
          </div>
          <SecondaryButton
            className="px-4 py-2"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Spin size="large" /> : "Changer de mot de passe"}
          </SecondaryButton>
        </form>
      </FormProvider>
    </ItemCard>
  );
};
