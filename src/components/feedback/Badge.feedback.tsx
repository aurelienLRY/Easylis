/*utils*/
import { cn } from "@/utils/cn";
import { Tooltip } from "antd";

/* Types */
import { ICustomerSession } from "@/types";

/**
* Badge
* @param children : React.ReactNode
* @param className : string
*/
export  const Badge = ({children,className}:{children:React.ReactNode,className?:string}) => {
  return (
    <div className={cn("bg-slate-800 text-slate-400 p-2 rounded-md",className)}>
      {children}
    </div>
  )
}   


/**
* Global price badge
* @param price : number
* @param label : boolean
*/
export const GlobalPriceBadge = ({ price, label = true, className }: { price: number, label?: boolean, className?: string }) => {
  return (
    <Tooltip title="Prix total">
      <div className={`flex items-center gap-2 bg-slate-800 border border-slate-900 dark:bg-sky-900 dark:border-sky-800 p-2 rounded-md max-w-fit shadow-md ${className}`}>
        {label && <span className="text-slate-700 dark:text-slate-400 text-xs">Total</span>}
        <span className="text-white text-sm font-bold">{price} €</span>
      </div>
    </Tooltip>
  );
}

/** 
* Customer price badge
* @param price : number
* @param label : boolean
*/
export const CustomerPriceBadge = ({price , label = true }:{price:number, label? :boolean}) => {
  return (
    <Tooltip title="Prix par personne">
    <div className="flex items-center gap-2 bg-slate-800 border border-slate-900 dark:bg-sky-900 dark:border-sky-800 p-2 rounded-md max-w-fit shadow-md ">
        {label && <span className="text-slate-700 dark:text-slate-400  text-xs">Par personne</span>}
        <span className="text-white text-sm font-bold">{price} €</span>
    </div>
    </Tooltip>
  )
}


export const StatusBadge = ({customerSession , className}:{customerSession: ICustomerSession, className?:string}) => {
  const baseClass = "p-1 rounded-md text-sm flex flex-col items-center justify-center";
  switch (customerSession.status) {
    case "Waiting":
      return (
        <p className={cn(`${baseClass} bg-yellow-500 bg-opacity-50 border border-yellow-500`, className)}>
          <span>en attente</span>
          <span className="text-xs text-yellow-500">
            depuis le {customerSession.createdAt && new Date(customerSession.createdAt).toLocaleDateString()}
          </span>
        </p>
      );
    case "Validated":
      return (
        <p className={cn(`${baseClass} bg-green-500 bg-opacity-50 border border-green-500`, className)}>
          <span>Confirmé</span>
          <span className="text-xs text-green-500">
            le {customerSession.validatedAt && new Date(customerSession.validatedAt).toLocaleDateString()}
          </span>
        </p>
      );
    case "Canceled":
      return (
        <p className={cn(`${baseClass} bg-red-500 bg-opacity-50 border border-red-500`, className)}>
          <span>Annulé</span>
          <span className="text-xs text-red-500">
            le {customerSession.canceledAt && new Date(customerSession.canceledAt).toLocaleDateString()}
          </span>
        </p>
      );
  }
}
