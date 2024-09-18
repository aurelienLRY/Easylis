/* LIBRAIRIES */
import React, { useState } from "react";
import { useSessionWithDetails } from "@/context/store";

/* ACTIONS */
import { CANCEL_CUSTOMER_SESSION } from "@/libs/actions";

/* Types */
import { ICustomerSession } from "@/types";

/* Components */
import Modal from "@/components/Modal";
import CustomerFiche from "@/components/CustomerFiche";
import { Tooltip } from "antd";
import ToasterAction from "@/components/ToasterAction";


/* Utils */
import { capitalizeFirstLetter } from "@/utils/typo";

/* Icons */
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { RiCalendarCloseFill } from "react-icons/ri";
import { TbListDetails } from "react-icons/tb";

/*
 * CustomerCard Component
 * @param customer: ICustomerSession
 * @returns JSX.Element
 */
const CustomerCard = ({ customer , className }: { customer: ICustomerSession , className?: string }) => {
  const IsCanceled = capitalizeFirstLetter(customer.status) === "Canceled";
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // modal details

  const OncloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
  };

  const { updateSessionWithDetails } = useSessionWithDetails();

  const CancelCustomer = async () => {
    window.confirm("Voulez-vous annuler le client ?");
    {
      const result = await CANCEL_CUSTOMER_SESSION(customer._id);
      if (result.success) {
        if (result.data) {
          updateSessionWithDetails(result.data);
        }
      }
      ToasterAction({result, defaultMessage: 'Client annulé avec succès'})
    }
  };
 
  const displayStatus = {
    "Validated": {icon: "👍", name: "Validé"},
    "Canceled": {icon: "🖕", name: "Annulé"},
    "Waiting": {icon: "🕒", name: "En attente"},
  }

  return (
    <>
      <div
        className={`border border-gray-200 rounded-md p-2 min-w-[200px] relative ${
          IsCanceled ? "opacity-50 " : "opacity-100"
        } ${className}`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-2 items-center px-1">
            <p className="text-xl font-bold">
              {customer.first_names} {customer.last_name.toUpperCase()}
            </p>
            <Tooltip
              title={
                displayStatus[customer.status].name
              }
            >
              <span className="text-xl cursor-pointer">
                {displayStatus[customer.status].icon}
              </span>
            </Tooltip>
          </div>
          <div className="flex flex-col md:text-sm  ">
            <p className="  inline-flex items-center gap-1">
              <MdOutlineEmail className="text-gray-400 mr-1 " />{" "}
              {customer.email}
            </p>
            <p className=" inline-flex items-center gap-1">
              <FaPhoneAlt className="text-gray-400 mr-1" /> {customer.phone}
            </p>
            <p className="  inline-flex items-center gap-1">
              <MdPeopleAlt className="text-gray-400 mr-1 " />{" "}
              {customer.people_list.length} personnes
            </p>
            <div className="flex justify-end gap-6 md:gap-2 p-1">
              <Tooltip title="Voir les détails">
                <button onClick={() => setIsDetailsModalOpen(true)}>
                  <TbListDetails className="text-2xl hover:text-slate-200 cursor-pointer transition-all" />
                </button>
              </Tooltip>

              {!IsCanceled && (
                <Tooltip title="Annuler le client">
                  <button onClick={CancelCustomer}>
                    <RiCalendarCloseFill className="text-2xl hover:text-red-500 cursor-pointer transition-all" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isDetailsModalOpen} onClose={OncloseDetailsModal}>
        <CustomerFiche customer={customer} />
      </Modal>
    </>
  );
};

export default CustomerCard;
