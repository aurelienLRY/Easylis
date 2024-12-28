"use client";
/* libraries */
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Spin } from "antd";
import { toast } from "sonner";

/* actions & services */
import { CREATE_SESSION, UPDATE_SESSION } from "@/libs/ServerAction";
import { sessionSchema } from "@/libs/yup";
import {
  fetcherAddEvent,
  fetcherUpdateEvent,
} from "@/services/GoogleCalendar/ClientSide";

/* stores */
import {
  useSessionWithDetails,
  useSpots,
  useActivities,
  useProfile,
} from "@/store";

/* components */
import {
  Modal,
  Input,
  SelectInput,
  ToasterAction,
  InfoTooltips,
} from "@/components";

/* utils & types */
import { formatDate } from "@/utils/date.utils";
import { generateEvent } from "@/services/GoogleCalendar/ClientSide/generateEvent";
import { ISession, ISessionWithDetails, IActivity, IUser } from "@/types";
import { useMailer, MailerStore } from "@/hooks/useMailer";
import { EMAIL_SCENARIOS } from "@/libs/nodeMailer/TemplateV2/constants";

export type TSessionForm = {
  _id?: string;
  date: Date | string;
  startTime: string;
  status: string;
  endTime: string;
  activity: string;
  spot: string;
  placesMax: number;
  placesReserved: number;
  type_formule: string;
  duration: string;
};

export function SessionForm({
  data,
  isOpen,
  onClose,
}: {
  data?: ISessionWithDetails;
  isOpen: boolean;
  onClose: () => void;
}) {
  const isUpdate = !!data;
  const [oldSession, setOldSession] = useState<ISessionWithDetails | undefined>(
    data
  );
  const addSessionWithDetails = useSessionWithDetails(
    (state) => state.addSessionWithDetails
  );
  const updateSessionWithDetails = useSessionWithDetails(
    (state) => state.updateSessionWithDetails
  );
  const sessionsWithDetails = useSessionWithDetails(
    (state) => state.SessionWithDetails
  );
  const activities = useActivities((state) => state.Activities);
  const spots = useSpots((state) => state.Spots);
  const { profile } = useProfile();

  const [filteredActivities, setFilteredActivities] =
    useState<IActivity[]>(activities);
  const [filteredTypeFormule, setFilteredTypeFormule] = useState<
    { id: string; name: string }[]
  >([
    { id: "half_day", name: "Demi-journée" },
    { id: "full_day", name: "Journée" },
  ]);

  const methods = useForm<TSessionForm>({
    resolver: yupResolver(sessionSchema as any), // Ajout de 'as any' pour contourner l'erreur de typage
    defaultValues: {
      ...data,
      date: data?.date && formatDate(data.date),
      activity: data ? data.activity._id : "",
      spot: data ? data.spot._id : "",
      status: data ? data.status : "Actif",
      placesReserved: data ? data.placesReserved : 0,
      duration: data ? data.duration : "",
    },
  });
  const mailer: MailerStore = useMailer();

  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (data) {
      reset({
        ...data,
        date: data?.date && formatDate(data.date),
        activity: data.activity._id,
        spot: data.spot._id,
      });
    }
  }, [data, reset]);

  const watchSpot = methods.watch("spot");
  const watchActivity = methods.watch("activity");
  const watchDate = methods.watch("date");
  const watchFormule = methods.watch("type_formule");

  useEffect(() => {
    const interActivities =
      spots.find((spot) => spot._id === watchSpot)?.practicedActivities || [];
    const filteredActivities = activities.filter((activity) =>
      interActivities
        .map((interActivity) => interActivity.activityId)
        .filter((activityId): activityId is string => !!activityId) // Ajout de cette ligne pour filtrer les 'undefined'
        .includes(activity._id as string)
    );
    setFilteredActivities(filteredActivities);
  }, [watchSpot, activities, spots]);

  useEffect(() => {
    const thisActivity = activities.find(
      (activity) => activity._id === watchActivity
    );
    if (thisActivity) {
      const typeFormuleOptions = [];
      if (thisActivity.half_day)
        typeFormuleOptions.push({ id: "half_day", name: "Demi-journée" });
      if (thisActivity.full_day)
        typeFormuleOptions.push({ id: "full_day", name: "Journée" });
      setFilteredTypeFormule(typeFormuleOptions);
      methods.setValue("placesMax", thisActivity.max_OfPeople);
    } else {
      setFilteredTypeFormule([
        { id: "half_day", name: "Demi-journée" },
        { id: "full_day", name: "Journée" },
      ]);
    }
  }, [watchActivity, activities, methods]);

  useEffect(() => {
    if (!isUpdate) {
      const sessionExists = sessionsWithDetails.some(
        (session) =>
          new Date(session.date).toDateString() ===
          new Date(watchDate).toDateString()
      );
      if (sessionExists) {
        setError("date", {
          type: "manual",
          message: "Cette date est déjà prise",
        });
      }
    }
  }, [watchDate, sessionsWithDetails, setError, isUpdate, isSubmitting]);

  useEffect(() => {
    // si update on ne change pas la durée sauf si la formule change
    if (watchFormule) {
      const isActivity = activities.find(
        (activity) => activity._id === watchActivity
      );
      if (isUpdate) {
        // Ne change la durée que si la formule change
        if (watchFormule === "half_day" && data?.type_formule !== "half_day") {
          methods.setValue("duration", isActivity?.duration?.half || "");
        } else if (
          watchFormule === "full_day" &&
          data?.type_formule !== "full_day"
        ) {
          methods.setValue("duration", isActivity?.duration?.full || "");
        }
      } else {
        // Pour une nouvelle session, définir la durée selon la formule
        if (watchFormule === "half_day") {
          methods.setValue("duration", isActivity?.duration?.half || "");
        } else if (watchFormule === "full_day") {
          methods.setValue("duration", isActivity?.duration?.full || "");
        } else {
          methods.setValue("duration", "");
        }
      }
    }
  }, [watchFormule, isUpdate, data, activities, watchActivity, methods]);

  const onSubmit = async (data: TSessionForm) => {
    const result = isUpdate
      ? await UPDATE_SESSION(data!._id as string, data as ISession)
      : await CREATE_SESSION(data as ISession);

    if (result.success) {
      if (result.data) {
        /* Gestion de l'événement dans le calendrier */
        const event = generateEvent(result.data);
        const sessionId = result.data._id;
        const refreshToken = profile?.tokenRefreshCalendar;
        if (refreshToken && sessionId) {
          isUpdate
            ? await fetcherUpdateEvent(refreshToken, event, sessionId)
            : await fetcherAddEvent(refreshToken, event, sessionId);
        } else {
          toast.error(
            "Votre calendrier n'est pas connecté, l'évènement n'a pas été mis à jour dans votre calendrier"
          );
        }
        /* Gestion de la session dans le store */
        isUpdate
          ? updateSessionWithDetails(result.data)
          : addSessionWithDetails(result.data);

        // Modification ici : on attend la vérification d'envoi d'email avant de fermer
        const shouldSendEmail = await MailerForUpdate(
          oldSession!,
          result.data,
          isUpdate,
          mailer,
          profile!
        );

        // On ne ferme le formulaire que si on n'envoie pas d'email
        if (!shouldSendEmail) {
          handleOnClose();
        }
      }
    }
    ToasterAction({
      result,
      defaultMessage: isUpdate
        ? "Session modifiée avec succès"
        : "Session créée avec succès",
    });
  };

  const handleOnClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleOnClose}
      title={isUpdate ? "Modifier la session" : "Créer une session"}
    >
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full justify-center items-center gap-6 text-white  py-4"
        >
          {/* FORM */}
          <div className="flex flex-col gap-3 items-center  border-2 rounded-md border-sky-500 w-full p-2">
            <p className="text-sky-500 text-xl font-bold flex items-center gap-2">
              Activité & Lieu
              <InfoTooltips title="Sélectionnez l'activité et le lieu de la session." />
            </p>
            <div className="w-full flex flex-col md:flex-row gap-2 items-center justify-center ">
              <SelectInput
                className="flex items-start md:items-center justify-center"
                wIsRaw={true}
                name="spot"
                options={spots.map((spot) => ({
                  id: spot._id,
                  name: spot.name,
                }))}
                label="Lieu"
              />
              <SelectInput
                className="flex  items-start md:items-center justify-center"
                name="activity"
                options={filteredActivities.map((activity) => ({
                  id: activity._id || "", // Ajout de '|| ""' pour s'assurer que 'id' est une chaîne de caractères
                  name: activity.name,
                }))}
                label="Activité"
              />
            </div>
          </div>

          <div className="flex flex-col  items-center gap-2">
            <p className="text-sky-500 text-xl font-bold flex items-center gap-2">
              Formule & Durée
              <InfoTooltips title="Sélectionnez le type de formule et la durée de la session." />
            </p>

            <div className="flex flex-col md:flex-row gap-2">
              {filteredTypeFormule && (
                <SelectInput
                  name="type_formule"
                  options={filteredTypeFormule}
                  label="Type de formule"
                />
              )}
              <Input name="duration" type="text" label="Durée" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 w-full p-2 rounded-md border-2 border-sky-500 ">
            <p className="text-sky-500 text-xl font-bold">Créneau horaire</p>
            <div className="flex flex-col md:flex-row gap-2 w-full">
              <Input name="date" type="date" label="Date" />
              <div className="flex  md:flex-col  items-center justify-between gap-2 w-full">
                <Input name="startTime" type="time" label="Heure de début" />
                <Input name="endTime" type="time" label="Heure de fin" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1  rounded-md w-full p-2">
            <p className="text-sky-500 text-xl font-bold">Gestion des places</p>
            <div className="flex flex-col md:flex-row gap-2">
              <Input name="placesMax" type="number" label="Places max" />
              <Input
                name="placesReserved"
                type="number"
                label="Places réservées"
              />
            </div>
          </div>
          {isUpdate && (
            <div className="flex flex-col items-center gap-1 p-2 rounded-md border-2 border-sky-500 w-full">
              <p className="text-sky-500 text-xl font-bold">Statut</p>
              <SelectInput
                name="status"
                options={[
                  { id: "Actif", name: "Validé" },
                  { id: "Pending", name: "En attente" },
                ]}
                label="Statut"
              />
            </div>
          )}

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

/**
 *  function to send email to customer when session is update
 * @param oldSession
 * @param newSession
 * @param isUpdate
 * @param mailer
 * @returns
 */
const MailerForUpdate = async (
  oldSession: ISessionWithDetails,
  newSession: ISessionWithDetails,
  isUpdate: boolean,
  mailer: MailerStore,
  profile: IUser
): Promise<boolean> => {
  if (!isUpdate || oldSession.customerSessions.length === 0) return false;

  const hasImportantChanges =
    oldSession.date !== newSession.date ||
    oldSession.startTime !== newSession.startTime ||
    oldSession.spot._id !== newSession.spot._id;

  if (hasImportantChanges) {
    const wantToSendEmail = window.confirm(
      `La session a été modifiée ! \nVoulez-vous envoyer un email aux clients ?`
    );

    if (wantToSendEmail) {
      const changes = {
        oldDate: oldSession?.date,
        oldStartTime: oldSession?.startTime,
        oldSpot: oldSession?.spot.name,
      };

      // filtrer les customer qui on un status annulé
      const customerSessions = newSession.customerSessions.filter(
        (customer) => customer.status !== "Canceled"
      );

      // On prépare le premier email seulement
      if (customerSessions.length > 0) {
        mailer.prepareEmail(EMAIL_SCENARIOS.UPDATE_CUSTOMER, {
          customer: customerSessions[0],
          session: newSession,
          profile_from: profile,
          changes: changes,
        });

        // On stocke les informations pour les prochains emails
        mailer.setQueuedEmails(
          customerSessions.slice(1).map((customer) => ({
            scenario: EMAIL_SCENARIOS.UPDATE_CUSTOMER,
            data: {
              customer,
              session: newSession,
              profile_from: profile,
              changes: changes,
            },
          }))
        );
      }

      return true;
    }
  }

  return false;
};
