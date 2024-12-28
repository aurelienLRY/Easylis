"use client";
/* libraries */
import React from "react";
import { usePathname } from "next/navigation";

/* Components */
import { DashboardNav } from "@/components";
import { getPathname } from "@/app/dashboard/template";

/* types */
import { ISessionWithDetails } from "@/types";

export const Dashboard = ({
  children,
  sessionsWithDetails,
}: {
  children: React.ReactNode;
  sessionsWithDetails: ISessionWithDetails[];
}) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-3 items-center min-h-screen w-full mt-10 md:mt-0 p-2 md:p-6">
      <div className="w-full flex flex-col gap-2 items-center md:items-start md:px-6">
        <h1 className="text-4xl font-bold">{getPathname(pathname)}</h1>
        <DashboardNav sessionsWithDetails={sessionsWithDetails} />
      </div>
      <div className="w-full flex flex-col items-start px-1md:px-4   py-6 ">
        {children}
      </div>
    </div>
  );
};
