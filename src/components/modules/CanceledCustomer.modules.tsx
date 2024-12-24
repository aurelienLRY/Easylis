"use client";
import React from "react";
import { Spin } from "antd";

/*Components*/
import { Modal } from "@/components";

/*hooks*/
import { useCustomer } from "@/hooks/useCustomer";
import { useMailer, MailerStore } from "@/hooks/useMailer";
/*Types*/
import { ISessionWithDetails, ICustomerSession } from "@/types";

/*Icons*/
import { MdOutlineEmail, MdPeopleAlt } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: ISessionWithDetails;
};

type CustomerStatus = "Validated" | "Canceled" | "Waiting";

type StatusDisplay = {
  [key in CustomerStatus]: {
    icon: string;
    name: string;
  };
};

/**
 * Ce composant représente la fenêtre d'annulation des clients.
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} props.isOpen - Indique si la fenêtre est ouverte.
 * @param {() => void} props.onClose - La fonction à exécuter lorsque la fenêtre est fermée.
 * @param {ISessionWithDetails} props.data - Les données de la session.
 * @returns {JSX.Element} Le composant fenêtre d'annulation des clients.
 */
export const CanceledCustomerSession = ({ isOpen, onClose, data }: Props) => {
  const mailer = useMailer();
  mailer.onClose = onClose;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Panneau d'annulation">
      <div className="flex flex-col gap-2 mt-4">
        {data.customerSessions.map(
          (customer: ICustomerSession, index: number) => (
            <CustomerCanceled
              key={index}
              customer={customer}
              onClose={onClose}
            />
          )
        )}
      </div>
    </Modal>
  );
};
/**
 * Ce composant représente un client annulé.
 * @param {object} props - Les propriétés du composant.
 * @param {ICustomerSession} props.customer - Le client à afficher.
 * @returns {JSX.Element} Le composant client annulé.
 */
export const CustomerCanceled = ({
  customer,
  onClose,
}: {
  customer: ICustomerSession;
  onClose: () => void;
}) => {
  const { CancelCustomer, isSubmitting } = useCustomer();
  const displayStatus: StatusDisplay = {
    Validated: { icon: "👍", name: "Validé" },
    Canceled: { icon: "🙄", name: "Annulé" },
    Waiting: { icon: "🕒", name: "En attente" },
  };

  return (
    <div
      className={`flex relative flex-col gap-2 p-2 rounded-md bg-sky-500/10 shadow-inner shadow-sky-500/20 transition-all duration-300 text-white ${
        customer.status === "Canceled" && "opacity-60"
      }`}
    >
      {customer.status === "Canceled" && (
        <div className="absolute top-2/3 right-1/2 transform translate-x-1/2 -translate-y-1/2">
          <p className="text-2xl text-center">
            {displayStatus[customer.status as CustomerStatus].icon}
          </p>
          <p className="text-4xl text-center">
            {displayStatus[customer.status as CustomerStatus].name}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-center">
          {customer.first_names} {customer.last_name}
        </h3>
      </div>

      <div
        className={`	flex flex-col md:flex-row gap-4 md:gap-2 items-center justify-between ${
          customer.status === "Canceled" ? "opacity-20" : ""
        }`}
      >
        <div className="flex flex-col gap-1 ">
          <p className="  inline-flex items-center gap-1">
            <MdOutlineEmail className="text-gray-400 mr-1 " /> {customer.email}
          </p>
          <p className=" inline-flex items-center gap-1">
            <FaPhoneAlt className="text-gray-400 mr-1" /> {customer.phone}
          </p>
          <p className="  inline-flex items-center gap-1">
            <MdPeopleAlt className="text-gray-400 mr-1 " />{" "}
            {customer.people_list.length} personnes
          </p>
        </div>
        {customer.status !== "Canceled" && (
          <button
            onClick={() => CancelCustomer(customer)}
            className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-all duration-300 min-w-[100px] min-h-[40px] flex items-center justify-center "
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spin size="small" /> : "Annuler"}
          </button>
        )}
      </div>
    </div>
  );
};
