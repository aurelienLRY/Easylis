import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiPhone } from "react-icons/hi2";

export const PhoneDisplay = ({ phone }: { phone: string }) => {
  return (
    <ItemDisplay icon={<HiPhone />} title="Téléphone">
      <a href={`tel:${phone}`}>{phone}</a>
    </ItemDisplay>
  );
};
