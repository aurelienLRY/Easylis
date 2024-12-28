"use client";

/* LIBRAIRIES */
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { InferType } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { userSchema } from "@/libs/yup";
import { Spin } from "antd";

/* stores */
import { useProfile } from "@/store";

/* components */
import { Input, SecondaryButton, ToasterAction } from "@/components";

/* actions */
import { UPDATE_USER } from "@/libs/ServerAction";

/* types */
import { IUser } from "@/types";

export const ProfilForm = () => {
  const { profile, updateProfile } = useProfile();
  const [isDisabled, setIsDisabled] = useState(true);

  const methods = useForm<InferType<typeof userSchema>>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      ...profile,
      username: profile?.username || "",
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (data: InferType<typeof userSchema>) => {
    if (!profile || !profile._id) return;
    // update user in database
    const result = await UPDATE_USER(profile._id as string, data as IUser);
    if (result.success && result.data) {
      // update user in session
      updateProfile(result.data);
    }
    ToasterAction({
      result,
      defaultMessage: "Profil modifié avec succès",
    });
    setIsDisabled(true);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-2 py-7 flex flex-col gap-2 items-center justify-center "
      >
        <div className="flex gap-2 flex-col items-center justify-center">
          <Input
            label="Nom d'utilisateur"
            type="text"
            disabled={isDisabled}
            name="username"
            placeholder="Nom d'utilisateur"
            className="max-w-[150px] md:max-w-[250px]"
            wIsRaw={false}
          />
          <div className="flex gap-2 flex-col md:flex-row ">
            <Input
              label="Nom"
              type="text"
              name="lastName"
              disabled={isDisabled}
              placeholder="Nom de famille"
              className="max-w-[150px] md:max-w-[300px]"
              wIsRaw={false}
            />
            <Input
              label="Prénom"
              type="text"
              name="firstName"
              disabled={isDisabled}
              placeholder="Prénom"
              className="max-w-[150px] md:max-w-[300px]"
              wIsRaw={false}
            />
          </div>
        </div>
        <div className="flex gap-2 md:flex-row flex-col mb-4">
          <Input
            label="Email"
            name="email"
            type="email"
            disabled={isDisabled}
            placeholder="Email@example.com"
            className="max-w-[250px] md:max-w-[300px]"
            wIsRaw={false}
          />
          <Input
            label="Téléphone"
            name="phone"
            type="string"
            disabled={isDisabled}
            placeholder="06 00 00 00 00"
            className="max-w-[250px] md:max-w-[300px]"
            wIsRaw={false}
          />
        </div>

        {isDisabled ? (
          <p
            className={`bg-orange-600 hover:bg-orange-700 transition-all duration-300  rounded-md py-2 px-4 cursor-pointer min-h-5 min-w-10`}
            onClick={() => setIsDisabled(false)}
          >
            {isSubmitting ? <Spin /> : "Modifier"}
          </p>
        ) : (
          <SecondaryButton type="submit" className="py-2 px-4 min-h-5 min-w-10">
            {isSubmitting ? <Spin size="small" /> : "Enregistrer"}
          </SecondaryButton>
        )}
      </form>
    </FormProvider>
  );
};
