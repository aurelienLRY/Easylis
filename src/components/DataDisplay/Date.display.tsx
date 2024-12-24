import { ItemDisplay } from "./Item.display";
import { formatDateToLocaleDateString } from "@/utils";
/*Icons*/
import { HiCalendarDateRange } from "react-icons/hi2";

export const DateDisplay = ({ date }: { date: Date }) => {
  return (
    <ItemDisplay icon={<HiCalendarDateRange />} title="Date">
      <p>{formatDateToLocaleDateString(date)}</p>
    </ItemDisplay>
  );
};
