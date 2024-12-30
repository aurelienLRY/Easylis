import { Tooltip } from "antd";
import React from "react";

interface ItemDisplayProps {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}

export const ItemDisplay = ({ children, icon, title }: ItemDisplayProps) => {
  return (
    <Tooltip title={title}>
      <div className="flex flex-col items-center gap-2 relative bg-orange-700 px-4 py-2 rounded-md w-fit max-h-fit text-center">
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 text-4xl">
          {icon}
        </div>
        <div className="flex flex-col items-center justify-center p-2">
          {children}
          <p className="text-sm italic font-thin opacity-50">{title}</p>
        </div>
      </div>
    </Tooltip>
  );
};
