"use client";

/* librairies */
import { Tooltip } from "antd";
import { toast } from "sonner";
import React, { useState } from "react";

/* actions */
import { DELETE_SESSION, UPDATE_SESSION } from "@/libs/ServerAction";

/*store*/
import { useSessionWithDetails, useProfile } from "@/store";

/*components*/
import {
  ItemCard,
  ItemCardInner,
  DetailButton,
  EditButton,
  DeleteButton,
  ToasterAction,
} from "@/components";

/* utils */
import {
  calculateSessionIncome,
  customerIsCancelled,
  customerIsWaiting,
  customerWaitingCount,
} from "@/utils";

/* Types */
import { ISessionWithDetails } from "@/types";

/*icons*/
import { RiCalendarCloseFill } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import { fetcherDeleteEvent } from "@/services/GoogleCalendar/ClientSide";

type Props = {
  sessionWithDetails: ISessionWithDetails;
  detailsModal: (session: ISessionWithDetails) => void;
  updateSessionModal: (session: ISessionWithDetails) => void;
  addCustomerModal: (session: ISessionWithDetails) => void;
  canceledCustomerModal: (session: ISessionWithDetails) => void;
};

/**
 * SessionCard Component
 * @param {ISessionWithDetails} customerSession - La session avec les détails du client.
 * @returns {JSX.Element} Le composant carte de session.
 */
export const SessionCard = ({
  sessionWithDetails,
  detailsModal,
  updateSessionModal,
  addCustomerModal,
  canceledCustomerModal,
}: Props) => {
  const [calculateRevenue, setCalculateRevenue] = useState(0);

  // modal canceled customer session
  const { updateSessionWithDetails, deleteSessionWithDetails } =
    useSessionWithDetails();

  const { profile } = useProfile();

  // Statuts vérifiés
  const checked = {
    customerIsCancelled: customerIsCancelled(
      sessionWithDetails.customerSessions
    ),
    customerIsWaiting: customerIsWaiting(sessionWithDetails.customerSessions),
    isArchived: sessionWithDetails.status === "Archived",
    isReserved: +sessionWithDetails.placesReserved > 0,
    isPending: sessionWithDetails.status === "Pending",
    isActive: sessionWithDetails.status === "Actif",
  };

  React.useEffect(() => {
    setCalculateRevenue(calculateSessionIncome(sessionWithDetails));
  }, [sessionWithDetails]);

  // Supprimer une session
  const deleteSession = async (sessionId: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
      const result = await DELETE_SESSION(sessionId);
      if (result.success) {
        deleteSessionWithDetails(sessionWithDetails);
        const deleteEvent = await fetcherDeleteEvent(
          profile?.tokenRefreshCalendar as string,
          sessionWithDetails._id as string
        );
      }
      ToasterAction({
        result,
        defaultMessage: "Session supprimée avec succès",
      });
    }
  };

  // Action de bascule (archiver ou annuler les réservations)

  const SwitchAction = async (session: ISessionWithDetails) => {
    if (checked.customerIsCancelled && !checked.isArchived) {
      if (window.confirm("Voulez-vous vraiment archiver cette session ?")) {
        const result = await UPDATE_SESSION(session._id, {
          ...session,
          activity: session.activity._id as string,
          spot: session.spot._id as string,
          status: "Archived",
        });
        if (result.success) {
          updateSessionWithDetails({ ...session, status: "Archived" });
          toast.success("Session archivée avec succès");
        } else {
          if (result.feedback) {
            toast.error(result.feedback);
          }
        }
      }
    } else if (
      checked.isReserved &&
      !checked.isArchived &&
      !checked.customerIsCancelled
    ) {
      canceledCustomerModal(sessionWithDetails);
    }
  };

  return (
    <ItemCard
      className={`flex flex-col justify-between gap-4 w-full max-w-[400px] box-border ${
        checked.isArchived
          ? "opacity-60 border-e-8 border-red-500"
          : checked.isPending
          ? "border-e-8 border-orange-500"
          : checked.isActive
          ? "border-e-8 border-green-500"
          : "opacity-100"
      }`}
    >
      <div className="w-full flex flex-col">
        <p className="text-center text-xl font-semibold m-0">
          {sessionWithDetails.activity.name}
        </p>
        {checked.isReserved && (
          <small className="text-xs font-light text-orange-500 text-center">
            🚀 {sessionWithDetails.placesReserved} places réservées 🚀
          </small>
        )}

        {checked.isReserved && calculateRevenue > 0 && (
          <p className="text-center text-sm font-semibold">
            💲 {calculateRevenue}€ 💲
          </p>
        )}
      </div>
      <ItemCardInner className="flex flex-col  w-full text-sm">
        <p>
          <span className="font-semibold">Date : </span>
          {new Date(sessionWithDetails.date).toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold">Horaire : </span>
          {`de ${sessionWithDetails.startTime} à ${sessionWithDetails.endTime}`}
        </p>
        <p>
          <span className="font-semibold">Lieu : </span>
          {sessionWithDetails.spot.name}
        </p>
        <p>
          <span className="font-semibold">Places disponibles : </span>
          {+sessionWithDetails.placesMax - +sessionWithDetails.placesReserved}
        </p>
        <p>
          <span className="font-semibold">Formule : </span>
          {sessionWithDetails.type_formule === "half_day"
            ? "demi-journée"
            : "journée"}{" "}
        </p>
      </ItemCardInner>

      <div
        id="session-card-footer"
        className="flex justify-end items-center gap-4 pb-2 w-full text-slate-400 "
      >
        {checked.isReserved && (
          <DetailButton
            onClick={() => detailsModal(sessionWithDetails)}
            className={`relative z-0 ${
              checked.customerIsWaiting ? "text-orange-600" : "text-slate-400"
            }`}
          >
            {checked.customerIsWaiting && (
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {customerWaitingCount(sessionWithDetails.customerSessions)}
              </span>
            )}
          </DetailButton>
        )}

        {!checked.isArchived && (
          <>
            <Tooltip title="Ajouter des participants">
              <button onClick={() => addCustomerModal(sessionWithDetails)}>
                <IoMdPersonAdd className="text-2xl hover:text-slate-200 cursor-pointer transition-all" />
              </button>
            </Tooltip>

            <EditButton
              title="Modifier la session"
              onClick={() => updateSessionModal(sessionWithDetails)}
            />

            <DeleteButton
              title={
                checked.isReserved
                  ? "Annuler les réservations"
                  : "Archiver la session"
              }
              onClick={() => SwitchAction(sessionWithDetails)}
            />
          </>
        )}

        {checked.isArchived && checked.customerIsCancelled && (
          <Tooltip title="Supprimer la session">
            <button onClick={() => deleteSession(sessionWithDetails._id)}>
              <RiCalendarCloseFill className="text-2xl hover:text-slate-200 cursor-pointer transition-all" />
            </button>
          </Tooltip>
        )}
      </div>
    </ItemCard>
  );
};
