"use client";

/* libraries */
import React, { useEffect } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Spin } from "antd";

/* actions */
import { CREATE_SPOT, UPDATE_SPOT } from "@/libs/ServerAction";
import { spotSchema } from "@/libs/yup";

/* stores */
import { useSpots, useActivities } from "@/store";

/* types */
import { ISpot, IActivity, ICustomerSession } from "@/types";

/* components */
import {
  Input,
  CheckboxInput,
  Textarea,
  SimpleCheckboxInput,
  Modal,
  ToasterAction,
} from "@/components";

const practicedActivitiesSchema = yup.array().of(
  yup.object().shape({
    activityId: yup.string().required("Le champ activityId est requis"),
    activityName: yup.string().required("Le champ activityName est requis"),
  })
);

const createDynamicSchema = (fields: Array<any>) => {
  return spotSchema.concat(
    yup.object().shape({
      practicedActivities: practicedActivitiesSchema.min(
        1,
        "Au moins une activité doit être sélectionnée"
      ),
    })
  );
};

export type TSpotForm = {
  _id?: string;
  name: string;
  description: string | undefined;
  gpsCoordinates: string;
  practicedActivities: {
    activityId: string;
    activityName: string;
  }[];
  photo: string | undefined;
  meetingPoint: {
    half_day: string | null;
    full_day: string | null;
  };
  half_day: boolean;
  full_day: boolean;
};

export function SpotForm({
  data,
  isOpen,
  onClose,
}: {
  data?: ISpot;
  isOpen: boolean;
  onClose: () => void;
}) {
  const isUpdate = !!data;

  const updateSpot = useSpots((state) => state.updateSpots);
  const activities = useActivities((state) => state.Activities);
  const methods = useForm<TSpotForm>({
    resolver: yupResolver(
      createDynamicSchema([])
    ) as unknown as Resolver<TSpotForm>,
    defaultValues: {
      ...data,
      meetingPoint: {
        half_day: data?.meetingPoint.half_day || null,
        full_day: data?.meetingPoint.full_day || null,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "practicedActivities",
    control: methods.control,
  });

  const onSubmit = async (data: TSpotForm) => {
    const result = isUpdate
      ? await UPDATE_SPOT(data!._id as string, data as unknown as ISpot)
      : await CREATE_SPOT(data as unknown as ISpot);

    if (result.success) {
      if (result.data) {
        updateSpot(result.data);
      }
      handleClose();
    }
    ToasterAction({
      result,
      defaultMessage: isUpdate
        ? "Lieu modifié avec succès"
        : "Lieu créé avec succès",
    });
  };

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    if (data) {
      reset({
        ...data,
      });
    }
  }, [data, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const watchHalfDay = methods.watch("half_day");
  const watchFullDay = methods.watch("full_day");

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col justify-center items-center gap-6"
        >
          {/* HEADER */}
          <div className="flex flex-col justify-center items-center gap-1">
            <h2 className="text-2xl font-bold">
              {isUpdate ? "Modifier le lieu" : "Créer un lieu"}
            </h2>
          </div>

          {/* FORM */}
          <div className="flex flex-col items-center gap-2 border-2 rounded-md border-sky-500 w-full p-2">
            <p className="text-sky-500 text-xl font-bold">
              Informations du lieu
            </p>

            <Input name="name" type="text" label="Nom" />
            <Textarea
              name="description"
              label="Description"
              placeholder="Description"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                name="gpsCoordinates"
                type="text"
                label="Coordonnées GPS site web"
                placeholder="Exemple: 48.8584, 2.2945"
              />
              <Input
                name="photo"
                type="text"
                label="Photo"
                placeholder="URL de la photo"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 border-2 rounded-md border-sky-500 w-full p-2">
            <p className="text-sky-500 text-xl font-bold">
              Activités pratiquées
            </p>

            {/* message d'erreur si aucune activité n'est sélectionnée */}
            {errors.practicedActivities && (
              <p className="text-red-500">
                Au moins une activité doit être sélectionnée
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 justify-around">
              {activities.map((activity: IActivity) => (
                <CheckboxInput
                  key={activity._id}
                  name={`practicedActivities.${activity._id}`}
                  label={activity.name}
                  checked={fields.some(
                    (field) => field.activityId === activity._id
                  )}
                  onChange={(e) => {
                    if (e.target.checked) {
                      append({
                        activityId: activity._id as string,
                        activityName: activity.name,
                      });
                    } else {
                      const index = fields.findIndex(
                        (field) => field.activityId === activity._id
                      );
                      if (index !== -1) remove(index);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 border-2 rounded-md border-sky-500 w-full p-2">
            <p className="text-sky-500 text-xl font-bold">Point de rencontre</p>
            <div className="flex flex-col  gap-4 w-full justify-center">
              <div className="flex justify-between gap-2">
                <SimpleCheckboxInput name="half_day" label="Demi-journée" />
                <Input
                  name="meetingPoint.half_day"
                  label="Point de rencontre demi-journée"
                  type="text"
                  placeholder="Exemple: 48.8584, 2.2945"
                  disabled={!watchHalfDay}
                />
              </div>
              <div className="flex justify-between gap-2">
                <SimpleCheckboxInput name="full_day" label="Journée complète" />
                <Input
                  name="meetingPoint.full_day"
                  label="Point de rencontre journée complète"
                  type="text"
                  placeholder="Exemple: 48.8584, 2.2945"
                  disabled={!watchFullDay}
                />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end items-center gap-1">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white w-fit mx-auto p-3 rounded-md flex items-center justify-center min-w-[70px] min-h-[40px] disabled:opacity-80 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spin size="default" />
              ) : isUpdate ? (
                "Modifier"
              ) : (
                "Créer"
              )}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
