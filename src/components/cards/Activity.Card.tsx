"use client";

/* Librairies */
import React, { useState } from "react";
import { IActivity } from "@/types";
import { Spin } from "antd";
import { toast } from "sonner";

/* Components */
import {
  ToasterAction,
  ItemCardHeader,
  ItemCardInner,
  ItemCard,
  EditButton,
  DeleteButton,
} from "@/components";

/* actions & services */
import { DELETE_ACTIVITY } from "@/libs/ServerAction";

/* stores */
import { useActivities, useSessionWithDetails } from "@/store";

/* Icons */
import { IoPeople } from "react-icons/io5";

interface Props {
  activity: IActivity;
  updateActivityModal: (activity: IActivity) => void;
}

/**
 * Composant pour afficher une carte d'activité avec ses détails
 * @component
 */
export function ActivityCard({ activity, updateActivityModal }: Props) {
  const [isDelete, setIsDelete] = useState(false);
  const { deleteActivities } = useActivities();
  const { SessionWithDetails } = useSessionWithDetails();

  /**
   * Gère la suppression d'une activité
   * @param activityId - L'ID de l'activité à supprimer
   */
  const handleDeleteActivity = async (activityId: string) => {
    if (!isActivityDeletable(activityId)) return;

    if (window.confirm("Voulez-vous vraiment supprimer cette activité ?")) {
      setIsDelete(true);
      const result = await DELETE_ACTIVITY(activityId);

      if (result.success && result.data) {
        deleteActivities(result.data);
      } else {
        setIsDelete(false);
      }

      ToasterAction({
        result,
        defaultMessage: "Activité supprimée avec succès",
      });
    }
  };

  /**
   * Vérifie si une activité peut être supprimée
   * @param activityId - L'ID de l'activité à vérifier
   * @returns boolean
   */
  const isActivityDeletable = (activityId: string): boolean => {
    const isUsedInSession = SessionWithDetails.some(
      (session) => session.activity._id === activityId
    );

    if (isUsedInSession) {
      toast.error(
        "Cette activité est utilisée dans une session, vous ne pouvez pas la supprimer. Veuillez d'abord supprimer la session."
      );
      return false;
    }
    return true;
  };

  /**
   * Rendu du tableau des tarifs
   */
  const renderPriceTable = () => (
    <table className="w-full border-collapse border-2 border-sky-500 rounded-md">
      <thead>
        <tr>
          <th className="border border-sky-500 p-2"></th>
          {activity.half_day && (
            <th className="border border-sky-500 p-2">Demi-journée</th>
          )}
          {activity.full_day && (
            <th className="border border-sky-500 p-2">Journée complète</th>
          )}
        </tr>
      </thead>
      <tbody className="text-center">
        {renderPriceRow(
          "Standard",
          activity.price_half_day?.standard,
          activity.price_full_day?.standard
        )}
        {renderPriceRow(
          "Réduit",
          activity.price_half_day?.reduced,
          activity.price_full_day?.reduced
        )}
        {renderPriceRow(
          "ACM",
          activity.price_half_day?.ACM,
          activity.price_full_day?.ACM
        )}
      </tbody>
    </table>
  );

  /**
   * Rendu d'une ligne de tarif
   */
  const renderPriceRow = (
    label: string,
    halfDayPrice?: number,
    fullDayPrice?: number
  ) => (
    <tr className="hover:bg-orange-500 transition-all duration-200">
      <td className="border border-sky-500 p-2">{label}</td>
      {activity.half_day && (
        <td className="border border-sky-500 p-2">
          {halfDayPrice !== undefined ? `${halfDayPrice}€` : "N/A"}
        </td>
      )}
      {activity.full_day && (
        <td className="border border-sky-500 p-2">
          {fullDayPrice !== undefined ? `${fullDayPrice}€` : "N/A"}
        </td>
      )}
    </tr>
  );

  /**
   * Rendu du tableau des durées
   */
  const renderDurationTable = () => (
    <table className="w-full border-collapse border-2 border-sky-500 rounded-md">
      <thead>
        <tr>
          {activity.half_day && (
            <th className="border border-sky-500 p-2">Demi-journée</th>
          )}
          {activity.full_day && (
            <th className="border border-sky-500 p-2">Journée complète</th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr className="hover:bg-orange-500 transition-all duration-200 text-center">
          {activity.half_day && (
            <td className="border border-sky-500 p-2">
              {activity.duration?.half || "N/A"}
            </td>
          )}
          {activity.full_day && (
            <td className="border border-sky-500 p-2">
              {activity.duration?.full || "N/A"}
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );

  return (
    <ItemCard className="flex flex-col gap-2 justify-between w-full h-full relative">
      {isDelete && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10 backdrop-blur-md flex flex-col gap-4 items-center justify-center">
          <Spin size="large" />
          <p className="text-white text-xl font-bold">
            Suppression de l&apos;activité en cours.
          </p>
        </div>
      )}

      <ItemCardHeader className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">{activity.name}</h2>
      </ItemCardHeader>

      <div className="flex flex-col gap-4">
        {/* Description */}
        <div className="flex flex-col md:flex-row gap-2 w-full justify-center items-center border-2 border-sky-600 p-2 rounded-md">
          <h3 className="text-lg font-bold text-gray-400 dark:text-sky-500">
            Description:{" "}
          </h3>
          <p className="text-sm text-center md:text-justify px-2">
            {activity.description ||
              "🧐 Ajouter une description à votre activité 🧐"}
          </p>
        </div>

        {/* Prix et durées */}
        <ItemCardInner className="flex flex-col gap-4 w-full justify-center items-center">
          <div className="flex flex-col gap-2 w-full justify-center items-center">
            <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
              Tarification
            </h3>
            {renderPriceTable()}
          </div>
          <div className="flex flex-col gap-2 w-full justify-center items-center">
            <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
              Durée
            </h3>
            {renderDurationTable()}
          </div>
        </ItemCardInner>

        {/* Caractéristiques */}
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
            Caractéristiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Âge minimum", value: `${activity.min_age} ans` },
              {
                label: "Nombre minimum",
                value: activity.min_OfPeople,
                icon: <IoPeople />,
              },
              {
                label: "Nombre maximum",
                value: activity.max_OfPeople,
                icon: <IoPeople />,
              },
            ].map((item: { label: string; value: string | number; icon?: React.ReactNode }, index: number) => (
              <div
                key={index}
                className="flex flex-col justify-around items-center gap-1 bg-orange-500 rounded-md p-2 text-center"
              >
                <p>{item.label}</p>
                <p className="flex items-center gap-1">
                  <span className="font-bold">{item.value}</span>
                  {item.icon}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Équipement requis */}
        {activity.required_equipment && (
          <ItemCardInner className="flex flex-col gap-2 w-full justify-center items-center">
            <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
              Préconisations
            </h3>
            <div
              className="w-full h-full p-4 "
              dangerouslySetInnerHTML={{ __html: activity.required_equipment }}
            />
          </ItemCardInner>
        )}
      </div>

      {/* Footer avec boutons d'action */}
      <div className="w-full flex justify-end gap-4 p-2">
        <EditButton onClick={() => updateActivityModal(activity)} />
        <DeleteButton
          onClick={() => handleDeleteActivity(activity._id as string)}
        />
      </div>
    </ItemCard>
  );
}
