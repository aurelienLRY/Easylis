import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiMapPin } from "react-icons/hi2";

export const LocationDisplay = ({ location }: { location: string }) => {
  return (
    <ItemDisplay icon={<HiMapPin />} title="Lieu">
      <p>{location}</p>
    </ItemDisplay>
  );
};
