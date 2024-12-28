import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiUserGroup } from "react-icons/hi2";

export const RemainingBookingsDisplay = ({
  remainingBookings,
}: {
  remainingBookings: number;
}) => {
  return (
    <ItemDisplay icon={<HiUserGroup />} title="Réservations restantes">
      <p>{remainingBookings}</p>
    </ItemDisplay>
  );
};
