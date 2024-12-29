/*libraries*/
import React from "react";

/*types*/
import { ICustomerSession, ISessionWithDetails } from "@/types";

/*components*/
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

/*utils*/
import { calculateSessionIncome } from "@/utils/price.utils";

/* Hooks & stores */
import { useModal } from "@/hooks";
import { useMailer } from "@/hooks/useMailer";

/**
 * SessionDetailCard Component
 * @param {ISessionWithDetails} data - La session avec les détails du client.
 * @param {boolean} isOpen - Indicateur d'ouverture de la modal.
 * @param {() => void} onClose - Fonction de fermeture de la modal.
 * @returns {JSX.Element} Le composant carte de détail de session.
 */
export function SessionDetailCard({
  data,
  isOpen,
  onClose,
}: {
  data: ISessionWithDetails;
  isOpen: boolean;
  onClose: () => void;
}) {
  const detailsCustomerModal = useModal<ICustomerSession>();
  const getPrice_total = calculateSessionIncome(data);

  const mailer = useMailer();

  mailer.onClose = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détail de la session">
      <div className="flex flex-col gap-8 items-center text-white  box-border max-w-[99%] ">
        <ItemCardInner className=" flex flex-col items-center px-4 ">
          <p className="text-center text-2xl font-semibold m-0">
            {data.activity.name}
          </p>
          {+data.placesReserved > 0 && (
            <small className="text-lg font-light text-orange-500 text-center">
              🚀 {data.placesReserved} places réservées 🚀
            </small>
          )}
          {getPrice_total > 0 && (
            <p className="text-center text-sm font-semibold">
              💲 {getPrice_total}€ 💲
            </p>
          )}
        </ItemCardInner>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 gap-y-8 max-w-[80%]  align-middle place-items-center ">
          <DateDisplay date={new Date(data.date)} />
          <TimeDisplay startTime={data.startTime} endTime={data.endTime} />
          <LocationDisplay location={data.spot.name} />
          <RemainingBookingsDisplay
            remainingBookings={+data.placesMax - +data.placesReserved}
          />
          <PlanDisplay plan={data.type_formule} />
        </div>
        <div className="w-[90%] overflow-x-scroll">
          <CustomerTables_Session
            data={data}
            detailsCustomer={detailsCustomerModal.openModal}
          />
        </div>
      </div>
      {detailsCustomerModal && (
        <CustomerFiche
          customer={detailsCustomerModal.data as ICustomerSession}
          isOpen={detailsCustomerModal.isOpen}
          onClose={detailsCustomerModal.closeModal}
        />
      )}
    </Modal>
  );
}
