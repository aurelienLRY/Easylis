import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiClock } from "react-icons/hi2";

export const TimeDisplay = ({
  startTime,
  endTime,
}: {
  startTime: string;
  endTime: string;
}) => {
  return (
    <ItemDisplay icon={<HiClock />} title="Horaire">
      <p>{`de ${startTime} à ${endTime}`}</p>
    </ItemDisplay>
  );
};
