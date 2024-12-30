"use client";

/* libraries */
import React, { memo } from "react";

/* types */
import { ICustomerSession, ISessionWithDetails } from "@/types";

/* components */
import {
  Modal,
  CustomerFiche,
  DateDisplay,
  TimeDisplay,
  LocationDisplay,
  RemainingBookingsDisplay,
  PlanDisplay,
  ItemCardInner,
  CustomerTables_Session,
} from "@/components";

/* utils */
import { calculateSessionIncome } from "@/utils/price.utils";

/* Hooks & stores */
import { useModal } from "@/hooks";
import { useMailer } from "@/hooks/useMailer";

interface SessionDetailCardProps {
  data: ISessionWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Composant pour afficher l'en-tête de la session
 */
const SessionHeader = memo(
  ({
    activity,
    placesReserved,
    totalPrice,
  }: {
    activity: string;
    placesReserved: number;
    totalPrice: number;
  }) => (
    <ItemCardInner className="flex flex-col items-center px-4">
      <p className="text-center text-2xl font-semibold m-0">{activity}</p>
      {placesReserved > 0 && (
        <small className="text-lg font-light text-orange-500 text-center">
          🚀 {placesReserved} places réservées 🚀
        </small>
      )}
      {totalPrice > 0 && (
        <p className="text-center text-sm font-semibold">💲 {totalPrice}€ 💲</p>
      )}
    </ItemCardInner>
  )
);

SessionHeader.displayName = "SessionHeader";

/**
 * Composant pour afficher les informations de la session
 */
const SessionInfo = memo(({ data }: { data: ISessionWithDetails }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 gap-y-8 max-w-[80%] align-middle place-items-center">
    <DateDisplay date={new Date(data.date)} />
    <TimeDisplay startTime={data.startTime} endTime={data.endTime} />
    <LocationDisplay location={data.spot.name} />
    <RemainingBookingsDisplay
      remainingBookings={+data.placesMax - +data.placesReserved}
    />
    <PlanDisplay plan={data.type_formule} />
  </div>
));

SessionInfo.displayName = "SessionInfo";

/**
 * Composant principal pour afficher les détails d'une session
 * @component
 */
export function SessionDetailCard({
  data,
  isOpen,
  onClose,
}: SessionDetailCardProps) {
  const detailsCustomerModal = useModal<ICustomerSession>();
  const totalPrice = calculateSessionIncome(data);
  const mailer = useMailer();

  // Configuration du mailer
  mailer.onClose = onClose;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détail de la session">
      <div className="flex flex-col gap-8 items-center text-white box-border max-w-[99%]">
        <SessionHeader
          activity={data.activity.name}
          placesReserved={+data.placesReserved}
          totalPrice={totalPrice}
        />
        <SessionInfo data={data} />

        <div className="w-[90%] overflow-x-scroll">
          <CustomerTables_Session
            data={data}
            detailsCustomer={detailsCustomerModal.openModal}
          />
        </div>
      </div>

      {detailsCustomerModal.isOpen && (
        <CustomerFiche
          customer={detailsCustomerModal.data as ICustomerSession}
          isOpen={detailsCustomerModal.isOpen}
          onClose={detailsCustomerModal.closeModal}
        />
      )}
    </Modal>
  );
}
