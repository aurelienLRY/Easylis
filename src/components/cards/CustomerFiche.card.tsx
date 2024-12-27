/* libraries */
import React from "react";
import { Tooltip } from "antd";
import { toast } from "sonner";

/* components */
import {
  DeleteButton,
  Modal,
  EmailDisplay,
  PhoneDisplay,
  BookingDateDisplay,
  ItemCardInner,
  TotalPriceDisplay,
} from "@/components";

/* utils & types */
import { getCustomerStatusDisplay } from "@/utils";
import { ICustomerSession } from "@/types";

/* stores & hooks */
import { useCustomer, useMailer } from "@/hooks";

/**
 * CustomerFiche Component
 * @param customer: ICustomerSession
 * @returns JSX.Element
 */
export const CustomerFiche = ({
  customer,
  isOpen,
  onClose,
}: {
  customer: ICustomerSession;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const mailer = useMailer();
  const { updateCustomer } = useCustomer();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean[]>(
    new Array(customer?.people_list?.length || 0).fill(false)
  );

  if (!customer) return null;
  mailer.onClose = () => {
    onClose();
  };

  const removePerson = async (index: number) => {
    if (customer.people_list.length === 1) {
      toast.error(
        "Vous ne pouvez pas retirer la dernière personne de la réservation, veuillez annuler la réservation."
      );
      return;
    }
    if (window.confirm("Voulez-vous vraiment retirer cette personne ?")) {
      let people_list = [...customer.people_list];

      try {
        setIsSubmitting((prev: boolean[]) =>
          prev.map((value: boolean, i: number) => (i === index ? true : value))
        );

        people_list.splice(index, 1);

        const data = {
          ...customer,
          people_list,
          number_of_people: people_list.length,
          price_total: people_list.reduce(
            (acc, person) => acc + person.price_applicable,
            0
          ),
        };
        await updateCustomer(data);
      } catch (error) {
        toast.error("Une erreur est survenue lors de la suppression");
        people_list = [...customer.people_list];
      } finally {
        setIsSubmitting(new Array(people_list.length).fill(false));
      }
    }
  };

  const IsCanceled = customer.status === "Canceled";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fiche client">
      <div className="flex flex-col gap-6 min-w-[300px] w-[80vw] max-w-[600px] mt-4">
        <ItemCardInner className="flex justify-between items-center px-4">
          <p className="text-2xl font-bold">
            {customer.first_names} {customer.last_name.toUpperCase()}
          </p>
          <Tooltip title={getCustomerStatusDisplay(customer.status).name}>
            <span className="text-4xl cursor-pointer">
              {getCustomerStatusDisplay(customer.status).icon}
            </span>
          </Tooltip>
        </ItemCardInner>

        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-8">
          <EmailDisplay email={customer.email} />
          <PhoneDisplay phone={customer.phone} />
          <BookingDateDisplay date={customer.createdAt} />
          <TotalPriceDisplay totalPrice={customer.price_total} />
        </div>

        <ItemCardInner className="flex flex-col gap-4  w-full p-4 ">
          <p className="text-center text-2xl">Détails du groupe</p>
          {customer.people_list.map((person: any, index: number) => (
            <div
              key={index}
              className={`flex items-center gap-2 justify-center rounded-md border border-gray-200 p-2  transition-all duration-300 ${
                IsCanceled ? "opacity-60" : "hover:bg-sky-900 opacity-100"
              }`}
            >
              <span className="font-bold text-4xl">🧍‍♂️</span>

              <p className={person.isReduced ? "text-orange-300 " : ""}>
                {person.isReduced ? (
                  <Tooltip title={`prix réduit`}>
                    {person.price_applicable} €
                  </Tooltip>
                ) : (
                  <>{person.price_applicable} €</>
                )}
              </p>

              <span className="font-bold text-xl"> -&gt; </span>
              <p>
                {person.size} cm | {person.weight}kg
              </p>
              {!IsCanceled && (
                <DeleteButton
                  isSubmitting={isSubmitting[index]}
                  title="Retirer"
                  onClick={() => removePerson(index)}
                />
              )}
            </div>
          ))}
        </ItemCardInner>
      </div>
    </Modal>
  );
};
