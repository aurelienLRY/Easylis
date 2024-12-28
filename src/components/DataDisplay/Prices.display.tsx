import { ItemDisplay } from "./Item.display";

/*Icons*/
import { HiCurrencyDollar } from "react-icons/hi2";

export const PricesDisplay = ({ prices }: { prices: number[] }) => {
  return (
    <ItemDisplay icon={<HiCurrencyDollar />} title="Prix">
      <p>{prices.join(", ")}</p>
    </ItemDisplay>
  );
};

export const TotalPriceDisplay = ({ totalPrice }: { totalPrice: number }) => {
  return (
    <ItemDisplay icon={<HiCurrencyDollar />} title="Prix total">
      <p>{totalPrice}</p>
    </ItemDisplay>
  );
};
