import { ItemDisplay } from "./Item.display";

/* Icons */
import { HiMail } from "react-icons/hi";

export const EmailDisplay = ({ email }: { email: string }) => {
  return (
    <ItemDisplay icon={<HiMail />} title="Email">
      <a href={`mailto:${email}`}>{email}</a>
    </ItemDisplay>
  );
};
