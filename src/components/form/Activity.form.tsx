"use client";

/* libraries */
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import { Spin } from "antd";
import { Editor } from "@tinymce/tinymce-react";
/* actions & services */
import { CREATE_ACTIVITY, UPDATE_ACTIVITY } from "@/libs/ServerAction";
import { activitySchema } from "@/libs/yup";

/* stores */
import { useActivities } from "@/store";

/* types */
import { IActivity } from "@/types";

/* components */
import {
  Input,
  Textarea,
  SimpleCheckboxInput,
  Modal,
  ToasterAction,
  InfoTooltips,
  ItemCard,
  ItemCardHeader,
  ItemCardInner,
} from "@/components";

export type TActivityForm = InferType<typeof activitySchema>;

// Ajout des constantes pour les configurations réutilisables
const EDITOR_CONFIG = {
  height: 300,
  menubar: false,
  plugins: ["lists", "emoticons"],
  toolbar:
    "undo redo | bold italic underline | alignleft aligncenter alignright alignfull | numlist bullist | emoticons",
  language: "fr_FR",
  browser_spellcheck: true,
};

const PRICE_TYPES = [
  { name: "standard", label: "Prix standard" },
  { name: "reduced", label: "Prix réduit" },
  { name: "ACM", label: "Prix ACM" },
] as const;

// Modification de l'interface Props pour plus de clarté
interface ActivityFormProps {
  data?: IActivity;
  isOpen: boolean;
  onClose: () => void;
}

// Ajout d'interfaces pour les props des sous-composants
interface PricingSectionProps {
  watchHalfDay: boolean;
  watchFullDay: boolean;
}

interface PricingColumnProps {
  title: string;
  prefix: string;
  disabled: boolean;
}

interface FormulaOptionProps {
  type: "half" | "full";
  isEnabled: boolean;
  label: string;
}

/**
 * Composant de formulaire pour la création/modification d'une activité
 * @component
 */
export function ActivityForm({ data, isOpen, onClose }: ActivityFormProps) {
  const initialValue = data?.required_equipment || "";
  const [requiredEquipment, setRequiredEquipment] =
    useState<string>(initialValue);

  const methods = useForm<TActivityForm>({
    resolver: yupResolver(activitySchema),
    defaultValues: {
      ...data,
      description: data?.description ?? "",
      price_half_day: data?.price_half_day || {
        standard: 0,
        reduced: 0,
        ACM: 0,
      },
      price_full_day: data?.price_full_day || {
        standard: 0,
        reduced: 0,
        ACM: 0,
      },
      duration: {
        half: data?.duration?.half ?? undefined,
        full: data?.duration?.full ?? undefined,
      },
      required_equipment: requiredEquipment,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const { updateActivities } = useActivities();

  useEffect(() => {
    reset({
      ...data,
      description: data?.description ?? "",
      price_half_day: data?.price_half_day || {
        standard: 0,
        reduced: 0,
        ACM: 0,
      },
      price_full_day: data?.price_full_day || {
        standard: 0,
        reduced: 0,
        ACM: 0,
      },
      duration: {
        half: data?.duration?.half ?? undefined,
        full: data?.duration?.full ?? undefined,
      },
      required_equipment: data?.required_equipment || "",
    });
  }, [data, reset]);

  const onSubmit = async (formData: TActivityForm) => {
    const COMPLETE_FORM_DATA = {
      ...formData,
      required_equipment: requiredEquipment,
    };

    let result;
    if (data?._id) {
      result = await UPDATE_ACTIVITY(data._id, COMPLETE_FORM_DATA as IActivity);
    } else {
      result = await CREATE_ACTIVITY(COMPLETE_FORM_DATA as IActivity);
    }

    if (result.success) {
      if (result.data) {
        updateActivities(result.data);
      }
      reset();
      onClose();
    }
    ToasterAction({
      result,
      defaultMessage: data?._id
        ? "Activité modifiée avec succès"
        : "Activité créée avec succès",
    });
  };

  const watchHalfDay = watch("half_day", false);
  const watchFullDay = watch("full_day", false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={data?._id ? "Modifier l'activité" : "Créer une activité"}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-4 py-4"
        >
          <Input name="name" type="text" label="Nom de l'activité" />
          <Textarea
            name="description"
            label="Description"
            rows={6}
            className="w-full"
          />

          <ItemCardInner className="w-full p-4">
            <table className="w-full border-collapse ">
              <tbody className="">
                <tr className="flex justify-center items-center gap-2 w-full">
                  <h3 className="text-sky-500 text-xl font-bold text-center ">
                    Formule
                  </h3>
                  <InfoTooltips title="Sélectionner si l’activité peut être pratiquée en une demi-journée et/ou en une journée complète" />
                </tr>
                <tr className="flex flex-col md:flex-row justify-around gap-2 w-full">
                  <td className="p-2 flex justify-center items-center">
                    <tr className="flex flex-col items-center  gap-2">
                      <SimpleCheckboxInput
                        name="half_day"
                        label="Demi-journée"
                      />
                      <Input
                        name="duration.half"
                        type="text"
                        label="Durée estimée"
                        disabled={!watchHalfDay}
                      />
                    </tr>
                  </td>
                  <td className="p-2 flex justify-center items-center">
                    <tr className="flex flex-col items-center  gap-2">
                      <SimpleCheckboxInput
                        name="full_day"
                        label="Journée complète"
                      />
                      <Input
                        name="duration.full"
                        type="text"
                        label="Durée estimée"
                        disabled={!watchFullDay}
                      />
                    </tr>
                  </td>
                </tr>

                <tr className="flex justify-center items-center gap-2 w-full">
                  <h3 className="text-sky-500 text-xl font-bold text-center ">
                    Tarification{" "}
                  </h3>
                  <InfoTooltips title="Renseigner les prix pour les formules sélectionnées " />
                </tr>
                <tr className="flex flex-col justify-around items-center md:flex-row gap-4 w-full">
                  <PricingColumn
                    title="Prix demi-journée"
                    prefix="price_half_day"
                    disabled={!watchHalfDay}
                  />
                  <PricingColumn
                    title="Prix journée complète"
                    prefix="price_full_day"
                    disabled={!watchFullDay}
                  />
                </tr>
              </tbody>
            </table>
          </ItemCardInner>
          <div className="flex flex-col gap-2 md:items-center">
            <div className="flex justify-center items-center gap-2">
              <h3 className="text-lg font-bold">Gestion des groupes</h3>
              <InfoTooltips title="Renseigner les nombres maximum et minimum de personnes pour les groupes" />
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-6">
              <Input
                name="max_OfPeople"
                type="number"
                label="Nombre maximum de personnes"
              />
              <Input
                name="min_OfPeople"
                type="number"
                label="Nombre minimum de personnes"
              />
            </div>
            <Input name="min_age" type="number" label="Age minimum" />
          </div>
          <RequiredEquipmentSection
            initialValue={initialValue}
            setRequiredEquipment={setRequiredEquipment}
          />

          <SubmitButton isSubmitting={isSubmitting} isEditing={!!data?._id} />
        </form>
      </FormProvider>
    </Modal>
  );
}

/**
 * Colonne de tarification améliorée avec mapping des types de prix
 */
function PricingColumn({ title, prefix, disabled }: PricingColumnProps) {
  return (
    <div
      className={`p-2 flex flex-col justify-center items-center gap-1 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="font-semibold text-center py-4">{title}</div>
      {PRICE_TYPES.map(({ name, label }) => (
        <Input
          key={name}
          name={`${prefix}.${name}`}
          type="number"
          label={label}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

/**
 * Section de l'équipement requis avec configuration externalisée
 */
function RequiredEquipmentSection({
  initialValue,
  setRequiredEquipment,
}: {
  initialValue: string;
  setRequiredEquipment: (content: string) => void;
}) {
  return (
    <ItemCardInner className="w-full p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center gap-2">
          <h3 className="text-sky-500 text-xl font-bold text-center">
            Équipement requis
          </h3>
          <InfoTooltips title="Renseigner les équipements nécessaires pour pratiquer l'activité. Le contenu de l'éditeur est visible dans les emails envoyés aux participants" />
        </div>
        <Editor
          textareaName="required_equipment"
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          initialValue={initialValue}
          init={{ ...EDITOR_CONFIG }}
          onEditorChange={setRequiredEquipment}
        />
      </div>
    </ItemCardInner>
  );
}

// Ajout d'une validation des props pour le bouton de soumission
function SubmitButton({
  isSubmitting,
  isEditing,
}: {
  isSubmitting: boolean;
  isEditing: boolean;
}) {
  const buttonText = isSubmitting ? (
    <Spin size="default" />
  ) : isEditing ? (
    "Modifier"
  ) : (
    "Créer"
  );

  return (
    <div className="flex justify-end items-center gap-1">
      <button
        type="submit"
        className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white w-fit mx-auto p-3 rounded-md flex items-center justify-center min-w-[70px] min-h-[40px] disabled:opacity-80 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {buttonText}
      </button>
    </div>
  );
}
