"use client";

import { Tooltip } from "antd";
import { toast } from "sonner";
import React, { useState, useMemo, useCallback } from "react";
import { DELETE_SESSION, UPDATE_SESSION } from "@/libs/ServerAction";
import { useSessionWithDetails, useProfile } from "@/store";
import {
  ItemCard,
  ItemCardInner,
  DetailButton,
  EditButton,
  DeleteButton,
  ToasterAction,
} from "@/components";
import {
  calculateSessionIncome,
  customerIsCancelled,
  customerIsWaiting,
  customerWaitingCount,
} from "@/utils";
import { ISessionWithDetails } from "@/types";
import { RiCalendarCloseFill } from "react-icons/ri";
import { IoMdPersonAdd } from "react-icons/io";
import { fetcherDeleteEvent } from "@/services/GoogleCalendar/ClientSide";

// Types
type SessionStatus = {
  customerIsCancelled: boolean;
  customerIsWaiting: boolean;
  isArchived: boolean;
  isReserved: boolean;
  isPending: boolean;
  isActive: boolean;
};

// Constants
const SESSION_STATUS = {
  ARCHIVED: "Archived",
  PENDING: "Pending",
  ACTIVE: "Actif",
} as const;

// Sous-composants
const SessionHeader = ({
  title,
  placesReserved,
  revenue,
}: {
  title: string;
  placesReserved?: number;
  revenue?: number;
}) => (
  <div className="w-full flex flex-col">
    <p className="text-center text-xl font-semibold m-0">{title}</p>
    {placesReserved && (
      <small className="text-xs font-light text-orange-500 text-center">
        🚀 {placesReserved} places réservées 🚀
      </small>
    )}
    {revenue && revenue > 0 && (
      <p className="text-center text-sm font-semibold">💲 {revenue}€ 💲</p>
    )}
  </div>
);

const SessionDetails = ({ session }: { session: ISessionWithDetails }) => (
  <ItemCardInner className="flex flex-col w-full text-sm">
    <p>
      <span className="font-semibold">Date : </span>
      {new Date(session.date).toLocaleDateString()}
    </p>
    <p>
      <span className="font-semibold">Horaire : </span>
      {`de ${session.startTime} à ${session.endTime}`}
    </p>
    <p>
      <span className="font-semibold">Lieu : </span>
      {session.spot.name}
    </p>
    <p>
      <span className="font-semibold">Places disponibles : </span>
      {+session.placesMax - +session.placesReserved}
    </p>
    <p>
      <span className="font-semibold">Formule : </span>
      {session.type_formule === "half_day" ? "demi-journée" : "journée"}
    </p>
  </ItemCardInner>
);

const SessionActions = ({
  session,
  status,
  onDetail,
  onAdd,
  onEdit,
  onSwitch,
  onDelete,
}: {
  session: ISessionWithDetails;
  status: SessionStatus;
  onDetail: () => void;
  onAdd: () => void;
  onEdit: () => void;
  onSwitch: () => void;
  onDelete: () => void;
}) => (
  <div className="flex justify-end items-center gap-4 pb-2 w-full text-slate-400">
    {status.isReserved && (
      <DetailButton
        onClick={onDetail}
        className={`relative z-0 ${
          status.customerIsWaiting ? "text-orange-600" : "text-slate-400"
        }`}
      >
        {status.customerIsWaiting && (
          <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {customerWaitingCount(session.customerSessions)}
          </span>
        )}
      </DetailButton>
    )}

    {!status.isArchived && (
      <>
        <Tooltip title="Ajouter des participants">
          <button onClick={onAdd}>
            <IoMdPersonAdd className="text-2xl hover:text-slate-200 cursor-pointer transition-all" />
          </button>
        </Tooltip>
        <EditButton title="Modifier la session" onClick={onEdit} />
        <DeleteButton
          title={
            status.isReserved
              ? "Annuler les réservations"
              : "Archiver la session"
          }
          onClick={onSwitch}
        />
      </>
    )}

    {status.isArchived && status.customerIsCancelled && (
      <Tooltip title="Supprimer la session">
        <button onClick={onDelete}>
          <RiCalendarCloseFill className="text-2xl hover:text-slate-200 cursor-pointer transition-all" />
        </button>
      </Tooltip>
    )}
  </div>
);

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
  const { updateSessionWithDetails, deleteSessionWithDetails } =
    useSessionWithDetails();
  const { profile } = useProfile();

  const sessionStatus = useMemo<SessionStatus>(
    () => ({
      customerIsCancelled: customerIsCancelled(
        sessionWithDetails.customerSessions
      ),
      customerIsWaiting: customerIsWaiting(sessionWithDetails.customerSessions),
      isArchived: sessionWithDetails.status === SESSION_STATUS.ARCHIVED,
      isReserved: +sessionWithDetails.placesReserved > 0,
      isPending: sessionWithDetails.status === SESSION_STATUS.PENDING,
      isActive: sessionWithDetails.status === SESSION_STATUS.ACTIVE,
    }),
    [sessionWithDetails]
  );

  React.useEffect(() => {
    setCalculateRevenue(calculateSessionIncome(sessionWithDetails));
  }, [sessionWithDetails]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!window.confirm("Voulez-vous vraiment supprimer cette session ?"))
        return;

      const result = await DELETE_SESSION(sessionId);
      if (result.success) {
        deleteSessionWithDetails(sessionWithDetails);
        await fetcherDeleteEvent(
          profile?.tokenRefreshCalendar as string,
          sessionWithDetails._id as string
        );
      }
      ToasterAction({
        result,
        defaultMessage: "Session supprimée avec succès",
      });
    },
    [sessionWithDetails, profile?.tokenRefreshCalendar]
  );

  const handleSwitchAction = useCallback(async () => {
    const { customerIsCancelled, isArchived, isReserved } = sessionStatus;

    if (customerIsCancelled && !isArchived) {
      if (!window.confirm("Voulez-vous vraiment archiver cette session ?"))
        return;

      const result = await UPDATE_SESSION(sessionWithDetails._id, {
        ...sessionWithDetails,
        activity: sessionWithDetails.activity._id as string,
        spot: sessionWithDetails.spot._id as string,
        status: SESSION_STATUS.ARCHIVED,
      });

      if (result.success) {
        updateSessionWithDetails({
          ...sessionWithDetails,
          status: SESSION_STATUS.ARCHIVED,
        });
        toast.success("Session archivée avec succès");
      } else if (result.feedback) {
        toast.error(result.feedback);
      }
    } else if (isReserved && !isArchived && !customerIsCancelled) {
      canceledCustomerModal(sessionWithDetails);
    }
  }, [sessionWithDetails, sessionStatus]);

  const cardClassName = useMemo(() => {
    const baseClass =
      "flex flex-col justify-between gap-4 w-full max-w-[400px] box-border";
    if (sessionStatus.isArchived)
      return `${baseClass} opacity-60 border-e-8 border-red-500`;
    if (sessionStatus.isPending)
      return `${baseClass} border-e-8 border-orange-500`;
    if (sessionStatus.isActive)
      return `${baseClass} border-e-8 border-green-500`;
    return baseClass;
  }, [sessionStatus]);

  return (
    <ItemCard className={cardClassName}>
      <SessionHeader
        title={sessionWithDetails.activity.name}
        placesReserved={
          sessionStatus.isReserved
            ? sessionWithDetails.placesReserved
            : undefined
        }
        revenue={sessionStatus.isReserved ? calculateRevenue : undefined}
      />
      <SessionDetails session={sessionWithDetails} />
      <SessionActions
        session={sessionWithDetails}
        status={sessionStatus}
        onDetail={() => detailsModal(sessionWithDetails)}
        onAdd={() => addCustomerModal(sessionWithDetails)}
        onEdit={() => updateSessionModal(sessionWithDetails)}
        onSwitch={handleSwitchAction}
        onDelete={() => deleteSession(sessionWithDetails._id)}
      />
    </ItemCard>
  );
};
