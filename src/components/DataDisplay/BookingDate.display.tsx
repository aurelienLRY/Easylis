import { ItemDisplay } from "./Item.display";
import { formatDateToLocaleDateString } from "@/utils";
/*Icons*/
import { HiCalendar } from "react-icons/hi2";

export const BookingDateDisplay = ({ date }: { date: Date }) => {
  return (
    <ItemDisplay icon={<HiCalendar />} title="Date de réservation">
      <p>{formatDateToLocaleDateString(date)}</p>
    </ItemDisplay>
  );
};
