"use client";

/* Librairies */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "antd";

/* Components */
import {
  DetailButton,
  EditButton,
  DeleteButton,
  GlobalPriceBadge,
  StatusBadge,
} from "@/components";

/* Hooks */
import { useCustomer } from "@/hooks";

/* Utils */
import {
  cn,
  capitalizeFirstLetter,
  typeOfReservation,
  customerWaitingCount,
} from "@/utils";
/* Types */
import { ISessionWithDetails, ICustomerSession } from "@/types";

/* icons*/
import { FaUser } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

type Props = {
  data: ISessionWithDetails;
  customerFiche: (data: ICustomerSession) => void;
  editCustomer: (data: {
    data: ICustomerSession;
    session: ISessionWithDetails;
  }) => void;
  isSubmitting?: boolean;
};

const variants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};
/**
 * Ce composant représente la table des réservations des clients.
 * @param {object} props - Les propriétés du composant.
 * @param {ISessionWithDetails} props.data - Les données de la session.
 * @param {() => void} props.customerFiche - La fonction à exécuter lorsque le bouton de fiche client est cliqué.
 * @param {(data: {data: ICustomerSession, session: ISessionWithDetails}) => void} props.editCustomer - La fonction à exécuter lorsque le bouton d'édition est cliqué.
 * @param {(data: ICustomerSession) => void} props.deleteCustomer - La fonction à exécuter lorsque le bouton de suppression est cliqué.
 * @returns {JSX.Element} Le composant table des réservations des clients.
 */
export const CustomerBookingTable = ({
  data,
  customerFiche,
  editCustomer,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleTable = () => {
    setIsOpen(!isOpen);
  };
  const C_WaitingCount = customerWaitingCount(data.customerSessions);

  const { CancelCustomer, isSubmitting } = useCustomer();

  return (
    <article
      className={cn(
        C_WaitingCount > 0 && "shadow-md shadow-orange-500",
        "overflow-hidden w-full border border-slate-300 dark:border-sky-700 rounded-md relative"
      )}
    >
      {C_WaitingCount > 0 && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-orange-600 rounded-full text-white p-1 text-xs flex justify-center items-center opacity-80">
          {C_WaitingCount}
        </span>
      )}
      <div
        id="customer-booking-table-header"
        className="flex justify-between items-center bg-slate-500 dark:bg-sky-900 px-4 py-3 rounded-t-md w-full text-white"
      >
        <h3 className="text-xl font-bold text-center md:text-left relative">
          {data.activity.name} du {new Date(data.date).toLocaleDateString()}
        </h3>
        <DetailButton
          title="Voir le détail"
          onClick={toggleTable}
          className={cn(
            "transition-all duration-300",
            isOpen ? "text-green-500" : "text-slate-500 "
          )}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-x-auto w-full"
          >
            <motion.table className="min-w-full">
              <thead className="bg-slate-300 dark:bg-sky-600 text-white">
                <tr>
                  <th className=" text-center py-2 px-2">Nom</th>
                  <th className="text-center py-2 px-1">Contact</th>
                  <th className="text-center py-2 px-1">Status</th>
                  <th className="text-center py-2 px-1">Enregistré par</th>
                  <th className="text-center py-2 px-1">Groupe de</th>
                  <th className="text-center py-2 px-1">Prix total</th>
                  <th className="text-center py-2 px-1"></th>
                </tr>
              </thead>
              <tbody className="text-sm text-center rounded-md">
                {data.customerSessions.map((customerSession, index) => (
                  <tr
                    key={index}
                    className="h-16 border-b rounded-md border-slate-300 dark:border-sky-700 hover:bg-slate-200 dark:hover:bg-orange-500 transition-all duration-300"
                  >
                    <td className="text-center px-2">
                      <div className="flex flex-col text-xl font-bold">
                        <span>
                          {capitalizeFirstLetter(customerSession.last_name)}{" "}
                          {capitalizeFirstLetter(customerSession.first_names)}
                        </span>
                        <Tooltip title="Appeler">
                          <a
                            href={`tel:${customerSession.phone}`}
                            className="m-0 p-0 text-xs font-normal text-slate-500"
                          >
                            {customerSession.phone}
                          </a>
                        </Tooltip>
                      </div>
                    </td>

                    <td className="text-center  px-1">
                      <Tooltip title="Envoyer un email">
                        <a
                          href={`mailto:${customerSession.email}`}
                          className=""
                        >
                          {customerSession.email}
                        </a>
                      </Tooltip>
                    </td>

                    <td className="text-center  px-1">
                      <div className="flex justify-center items-center">
                        <StatusBadge
                          customerSession={customerSession}
                          className="max-w-fit px-4"
                        />
                      </div>
                    </td>

                    <td className="text-center px-1">
                      <div className="flex flex-col">
                        <span>
                          {typeOfReservation(customerSession.typeOfReservation)}
                        </span>
                        <span className="text-xs font-normal text-slate-500">
                          {new Date(
                            customerSession.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className="text-center px-1">
                      <div className="flex items-center justify-center  gap-1 font-semibold">
                        <span className="">
                          {customerSession.number_of_people}
                        </span>
                        {customerSession.number_of_people > 1 ? (
                          <FaUserGroup />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                    </td>

                    <td className="text-center  px-1">
                      <div className="flex justify-center items-center">
                        <GlobalPriceBadge
                          price={customerSession.price_total}
                          label={false}
                        />
                      </div>
                    </td>
                    <td className="text-center px-2">
                      <div className="flex gap-3 items-center justify-start ">
                        <DetailButton
                          title="Voir la fiche client"
                          onClick={() => customerFiche(customerSession)}
                        />
                        {customerSession.status !== "Canceled" && (
                          <>
                            <EditButton
                              title="Modifier"
                              onClick={() =>
                                editCustomer({
                                  data: customerSession,
                                  session: data,
                                })
                              }
                            />
                            <DeleteButton
                              title="Annuler"
                              onClick={() => CancelCustomer(customerSession)}
                              isSubmitting={isSubmitting}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
