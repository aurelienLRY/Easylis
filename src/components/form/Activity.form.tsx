"use client";

/* libraries */
import React, { useEffect, useState, useCallback, memo } from "react";
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
  ItemCardInner,
} from "@/components";

/* Types et interfaces */
export type TActivityForm = InferType<typeof activitySchema>;

interface ActivityFormProps {
  data?: IActivity;
  isOpen: boolean;
  onClose: () => void;
}

interface PricingColumnProps {
  title: string;
  prefix: "price_half_day" | "price_full_day";
  disabled: boolean;
}

interface FormulaProps {
  type: "half" | "full";
  label: string;
  watchValue: boolean | undefined;
}

interface RequiredEquipmentProps {
  initialValue: string;
  setRequiredEquipment: (content: string) => void;
}

interface SubmitButtonProps {
  isSubmitting: boolean;
  isEditing: boolean;
}

/* Constantes */
const EDITOR_CONFIG = {
  height: 300,
  menubar: false,
  plugins: ["lists", "emoticons"] as string[],
  toolbar:
    "undo redo | bold italic underline | alignleft aligncenter alignright alignfull | numlist bullist | emoticons",
  language: "fr_FR",
  browser_spellcheck: true,
} as const;

const PRICE_TYPES = [
  { name: "standard" as const, label: "Prix standard" },
  { name: "reduced" as const, label: "Prix réduit" },
  { name: "ACM" as const, label: "Prix ACM" },
];

const INITIAL_PRICE_STATE = {
  standard: 0,
  reduced: 0,
  ACM: 0,
};

/**
 * Composant pour afficher une formule (demi-journée ou journée complète)
 */
const Formula = memo(({ type, label, watchValue }: FormulaProps) => (
  <div className="p-2 flex justify-center items-center">
    <div className="flex flex-col items-center gap-2">
      <SimpleCheckboxInput name={`${type}_day`} label={label} />
      <Input
        name={`duration.${type}`}
        type="text"
        label="Durée estimée"
        disabled={!watchValue}
      />
    </div>
  </div>
));

Formula.displayName = "Formula";

/**
 * Composant pour afficher une colonne de tarification
 */
const PricingColumn = memo(
  ({ title, prefix, disabled }: PricingColumnProps) => (
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
  )
);

PricingColumn.displayName = "PricingColumn";

/**
 * Section de l'équipement requis
 */
const RequiredEquipmentSection = memo(
  ({ initialValue, setRequiredEquipment }: RequiredEquipmentProps) => (
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
          init={EDITOR_CONFIG}
          onEditorChange={setRequiredEquipment}
        />
      </div>
    </ItemCardInner>
  )
);

RequiredEquipmentSection.displayName = "RequiredEquipmentSection";

/**
 * Bouton de soumission du formulaire
 */
const SubmitButton = memo(({ isSubmitting, isEditing }: SubmitButtonProps) => (
  <div className="flex justify-end items-center gap-1">
    <button
      type="submit"
      className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white w-fit mx-auto p-3 rounded-md flex items-center justify-center min-w-[70px] min-h-[40px] disabled:opacity-80 disabled:cursor-not-allowed"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <Spin size="default" />
      ) : isEditing ? (
        "Modifier"
      ) : (
        "Créer"
      )}
    </button>
  </div>
));

SubmitButton.displayName = "SubmitButton";

/**
 * Composant pour afficher le titre d'une section avec une infobulle
 */
const SectionTitle = memo(
  ({ title, tooltipText }: { title: string; tooltipText: string }) => (
    <div className="flex justify-center items-center gap-2">
      <h3 className="text-sky-500 text-xl font-bold text-center">{title}</h3>
      <InfoTooltips title={tooltipText} />
    </div>
  )
);

SectionTitle.displayName = "SectionTitle";

/**
 * Composant pour la section de gestion des groupes
 */
const GroupManagementSection = memo(() => (
  <div className="flex flex-col gap-2 md:items-center">
    <SectionTitle
      title="Gestion des groupes"
      tooltipText="Renseigner les nombres maximum et minimum de personnes pour les groupes"
    />
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
));

GroupManagementSection.displayName = "GroupManagementSection";

/**
 * Composant pour la section des formules (demi-journée/journée)
 */
const FormulasSection = memo(
  ({
    watchHalfDay,
    watchFullDay,
  }: {
    watchHalfDay: boolean | undefined;
    watchFullDay: boolean | undefined;
  }) => (
    <ItemCardInner className="w-full p-4">
      <table className="w-full border-collapse">
        <tbody>
          <tr className="flex justify-center items-center gap-2 w-full">
            <SectionTitle
              title="Formule"
              tooltipText="Sélectionner si l'activité peut être pratiquée en une demi-journée et/ou en une journée complète"
            />
          </tr>
          <tr className="flex flex-col md:flex-row justify-around gap-2 w-full">
            <Formula
              type="half"
              label="Demi-journée"
              watchValue={watchHalfDay}
            />
            <Formula
              type="full"
              label="Journée complète"
              watchValue={watchFullDay}
            />
          </tr>
          <tr className="flex justify-center items-center gap-2 w-full">
            <SectionTitle
              title="Tarification"
              tooltipText="Renseigner les prix pour les formules sélectionnées"
            />
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
  )
);

FormulasSection.displayName = "FormulasSection";

/**
 * Composant principal du formulaire d'activité
 */
export function ActivityForm({ data, isOpen, onClose }: ActivityFormProps) {
  const [requiredEquipment, setRequiredEquipment] = useState<string>(
    data?.required_equipment || ""
  );

  const { updateActivities } = useActivities();

  const methods = useForm<TActivityForm>({
    resolver: yupResolver(activitySchema),
    defaultValues: {
      ...data,
      description: data?.description ?? "",
      price_half_day: data?.price_half_day || INITIAL_PRICE_STATE,
      price_full_day: data?.price_full_day || INITIAL_PRICE_STATE,
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
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset({
      ...data,
      description: data?.description ?? "",
      price_half_day: data?.price_half_day || INITIAL_PRICE_STATE,
      price_full_day: data?.price_full_day || INITIAL_PRICE_STATE,
      duration: {
        half: data?.duration?.half ?? undefined,
        full: data?.duration?.full ?? undefined,
      },
      required_equipment: data?.required_equipment || "",
    });
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: TActivityForm) => {
      const completeFormData = {
        ...formData,
        required_equipment: requiredEquipment,
      };

      const result = data?._id
        ? await UPDATE_ACTIVITY(data._id, completeFormData as IActivity)
        : await CREATE_ACTIVITY(completeFormData as IActivity);

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
    },
    [data?._id, requiredEquipment, updateActivities, reset, onClose]
  );

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

          <FormulasSection
            watchHalfDay={watchHalfDay}
            watchFullDay={watchFullDay}
          />
          <GroupManagementSection />
          <RequiredEquipmentSection
            initialValue={requiredEquipment}
            setRequiredEquipment={setRequiredEquipment}
          />
          <SubmitButton isSubmitting={isSubmitting} isEditing={!!data?._id} />
        </form>
      </FormProvider>
    </Modal>
  );
}
