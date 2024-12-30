"use client";

/* Librairies */
import React, { useState, memo, useCallback } from "react";
import { IActivity, PriceType } from "@/types";
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

// Types et interfaces
interface Props {
  activity: IActivity;
  updateActivityModal: (activity: IActivity) => void;
}

interface PriceRowProps {
  label: string;
  halfDayPrice?: number;
  fullDayPrice?: number;
  showHalfDay: boolean;
  showFullDay: boolean;
}

interface CharacteristicItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DurationTableProps {
  halfDay: boolean;
  fullDay: boolean;
  duration: {
    half: string | null;
    full: string | null;
  };
}

/**
 * Composant pour afficher une ligne de prix
 */
const PriceRow = memo(
  ({
    label,
    halfDayPrice,
    fullDayPrice,
    showHalfDay,
    showFullDay,
  }: PriceRowProps) => (
    <tr className="hover:bg-orange-500 transition-all duration-200">
      <td className="border border-sky-500 p-2">{label}</td>
      {showHalfDay && (
        <td className="border border-sky-500 p-2">
          {halfDayPrice !== undefined ? `${halfDayPrice}€` : "N/A"}
        </td>
      )}
      {showFullDay && (
        <td className="border border-sky-500 p-2">
          {fullDayPrice !== undefined ? `${fullDayPrice}€` : "N/A"}
        </td>
      )}
    </tr>
  )
);

PriceRow.displayName = "PriceRow";

/**
 * Composant pour afficher le tableau des durées
 */
const DurationTable = memo(
  ({ halfDay, fullDay, duration }: DurationTableProps) => (
    <table className="w-full border-collapse border-2 border-sky-500 rounded-md">
      <thead>
        <tr>
          {halfDay && (
            <th className="border border-sky-500 p-2">Demi-journée</th>
          )}
          {fullDay && (
            <th className="border border-sky-500 p-2">Journée complète</th>
          )}
        </tr>
      </thead>
      <tbody>
        <tr className="hover:bg-orange-500 transition-all duration-200 text-center">
          {halfDay && (
            <td className="border border-sky-500 p-2">
              {duration.half || "N/A"}
            </td>
          )}
          {fullDay && (
            <td className="border border-sky-500 p-2">
              {duration.full || "N/A"}
            </td>
          )}
        </tr>
      </tbody>
    </table>
  )
);

DurationTable.displayName = "DurationTable";

/**
 * Composant pour afficher une caractéristique
 */
const CharacteristicCard = memo(
  ({ label, value, icon }: CharacteristicItem) => (
    <div className="flex flex-col justify-around items-center gap-1 bg-orange-500 rounded-md p-2 text-center">
      <p>{label}</p>
      <p className="flex items-center gap-1">
        <span className="font-bold">{value}</span>
        {icon}
      </p>
    </div>
  )
);

CharacteristicCard.displayName = "CharacteristicCard";

/**
 * Composant pour afficher le spinner de suppression
 */
const DeleteSpinner = memo(() => (
  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10 backdrop-blur-md flex flex-col gap-4 items-center justify-center">
    <Spin size="large" />
    <p className="text-white text-xl font-bold">
      Suppression de l&apos;activité en cours.
    </p>
  </div>
));

DeleteSpinner.displayName = "DeleteSpinner";

/**
 * Composant pour afficher la description
 */
const Description = memo(({ description }: { description?: string | null }) => (
  <div className="flex flex-col md:flex-row gap-2 w-full justify-center items-center border-2 border-sky-600 p-2 rounded-md">
    <h3 className="text-lg font-bold text-gray-400 dark:text-sky-500">
      Description:{" "}
    </h3>
    <p className="text-sm text-center md:text-justify px-2">
      {description || "🧐 Ajouter une description à votre activité 🧐"}
    </p>
  </div>
));

Description.displayName = "Description";

/**
 * Composant pour afficher l'équipement requis
 */
const RequiredEquipment = memo(({ equipment }: { equipment: string }) => (
  <ItemCardInner className="flex flex-col gap-2 w-full justify-center items-center">
    <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
      Préconisations
    </h3>
    <div
      className="w-full h-full p-4"
      dangerouslySetInnerHTML={{ __html: equipment }}
    />
  </ItemCardInner>
));

RequiredEquipment.displayName = "RequiredEquipment";

/**
 * Composant principal ActivityCard
 */
export function ActivityCard({ activity, updateActivityModal }: Props) {
  const [isDelete, setIsDelete] = useState(false);
  const { deleteActivities } = useActivities();
  const { SessionWithDetails } = useSessionWithDetails();

  const isActivityDeletable = useCallback(
    (activityId: string): boolean => {
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
    },
    [SessionWithDetails]
  );

  const handleDeleteActivity = useCallback(
    async (activityId: string) => {
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
    },
    [isActivityDeletable, deleteActivities]
  );

  // Caractéristiques de l'activité
  const characteristics: CharacteristicItem[] = [
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
  ];

  /**
   * Tableau des prix avec les différentes catégories
   */
  const priceCategories = [
    { label: "Standard", type: "standard" },
    { label: "Réduit", type: "reduced" },
    { label: "ACM", type: "ACM" },
  ] as const;

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
        {priceCategories.map(({ label, type }) => (
          <PriceRow
            key={type}
            label={label}
            halfDayPrice={activity.price_half_day?.[type]}
            fullDayPrice={activity.price_full_day?.[type]}
            showHalfDay={activity.half_day}
            showFullDay={activity.full_day}
          />
        ))}
      </tbody>
    </table>
  );

  return (
    <ItemCard className="flex flex-col gap-2 justify-between w-full h-full relative">
      {isDelete && <DeleteSpinner />}

      <ItemCardHeader className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">{activity.name}</h2>
      </ItemCardHeader>

      <div className="flex flex-col gap-4">
        <Description description={activity.description} />

        <ItemCardInner className="flex flex-col gap-4 w-full justify-center items-center">
          {/* Prix */}
          <div className="flex flex-col gap-2 w-full justify-center items-center">
            <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
              Tarification
            </h3>
            {renderPriceTable()}
          </div>
          {/* Durée */}
          <div className="flex flex-col gap-2 w-full justify-center items-center">
            <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
              Durée
            </h3>
            <DurationTable
              halfDay={activity.half_day}
              fullDay={activity.full_day}
              duration={activity.duration || {}}
            />
          </div>
        </ItemCardInner>

        {/* Caractéristiques */}
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <h3 className="text-xl font-bold text-gray-400 dark:text-sky-500">
            Caractéristiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {characteristics.map((item, index) => (
              <CharacteristicCard key={index} {...item} />
            ))}
          </div>
        </div>

        {/* Équipement requis */}
        {activity.required_equipment && (
          <RequiredEquipment equipment={activity.required_equipment} />
        )}
      </div>

      {/* Footer */}
      <div className="w-full flex justify-end gap-4 p-2">
        <EditButton onClick={() => updateActivityModal(activity)} />
        <DeleteButton
          onClick={() => handleDeleteActivity(activity._id as string)}
        />
      </div>
    </ItemCard>
  );
}
