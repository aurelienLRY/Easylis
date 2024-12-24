import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiMap } from "react-icons/hi2";

export const PlanDisplay = ({ plan }: { plan: string }) => {
  return (
    <ItemDisplay icon={<HiMap />} title="Formule">
      <p>{plan}</p>
    </ItemDisplay>
  );
};
