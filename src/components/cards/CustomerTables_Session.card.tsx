/* LIBRAIRIES */
import React from "react";
import { Tooltip } from "antd";

/* Components */
import {
  StatusBadge,
  GlobalPriceBadge,
  DetailButton,
  EditButton,
  DeleteButton,
} from "@/components";

/* utils & types */
import { ISessionWithDetails, ICustomerSession } from "@/types";
import { capitalizeFirstLetter, typeOfReservation } from "@/utils";

/* Icons */
import { FaUser } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

/* stores & hooks */
import { useCustomer } from "@/hooks";

/**
 * Composant CustomerTables_Session
 * @param {ICustomerSession} data - Les données des clients
 * @param {string} [className] - Classe CSS optionnelle pour le style personnalisé
 */
export const CustomerTables_Session = ({
  data,
  detailsCustomer,
}: {
  data: ISessionWithDetails;
  className?: string;
  detailsCustomer: (data: ICustomerSession) => void;
}) => {
  const { CancelCustomer, isSubmitting } = useCustomer();
  return (
    <table className="w-full rounded-md">
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
        {data.customerSessions.map(
          (customerSession: ICustomerSession, index: number) => (
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
                  <a href={`mailto:${customerSession.email}`} className="">
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
                    {new Date(customerSession.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </td>

              <td className="text-center px-1">
                <div className="flex items-center justify-center  gap-1 font-semibold">
                  <span className="">{customerSession.number_of_people}</span>
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
                    onClick={() => detailsCustomer(customerSession)}
                  />
                  {customerSession.status !== "Canceled" && (
                    <DeleteButton
                      title="Annuler"
                      onClick={async () => {
                        await CancelCustomer(customerSession);
                      }}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};
