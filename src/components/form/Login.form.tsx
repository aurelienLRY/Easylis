"use client";
/*Librairies*/
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spin } from "antd";

export type LoginFormData = {
  email: string;
  password: string;
};

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email invalide")
    .required("Renseignez votre email"),
  password: yup.string().required("Renseignez votre mot de passe"),
});

export const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = (await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })) as { error: string; ok: boolean };

    if (result.error) {
      toast.error(result.error);
    }
    if (result.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="min-h-[500px]  max-h-[700px] min-w-[350px] max-w-[400px]
     bg-sky-400 bg-opacity-5 backdrop-blur-sm flex flex-col justify-center items-center
      absolute top-1/2 right-1/2  translate-x-1/2 -translate-y-1/2  md:right-1/3  rounded-md"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 items-center justify-center h-full"
      >
        <h1 className="text-2xl font-bold">Se connecter</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className={`w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200 ${
              errors.email
                ? "border-red-500 shadow-md shadow-red-500"
                : "focus:border-emerald-600 focus:shadow-md focus:shadow-emerald-600 "
            }`}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          <span role="alert" className="text-red-500 text-sm min-h-3">
            {errors.email?.message}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="sr-only">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="Mot de passe"
            autoComplete="current-password"
            className={`w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200 ${
              errors.password
                ? "border-red-500 shadow-md shadow-red-500"
                : "focus:border-emerald-600 focus:shadow-md focus:shadow-emerald-600"
            }`}
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          <span role="alert" className="text-red-500 text-sm min-h-3">
            {errors.password?.message}
          </span>
        </div>
        <button
          type="submit"
          className="bg-sky-500 text-white px-4 py-1 rounded-md min-w-20 min-h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spin /> : "Se connecter"}
        </button>
      </form>
    </div>
  );
};
