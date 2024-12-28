"use client";

/* Components */
import { HeaderBtn } from "@/components";
import { useSession } from "next-auth/react";

/**
 * Header Component
 * @returns {JSX.Element} Le composant barre de navigation.
 */
export const Header = () => {
  const { status } = useSession();
  return (
    <header className="flex justify-between items-center p-3  lg:px-10 fixed top-0 w-full z-40 bg-slate-900 dark:bg-sky-950 text-white bg-opacity-60 backdrop-blur-md">
      <h1 className="text-4xl font-bold">
        {process.env.NEXT_PUBLIC_BRANDING_NAME}
      </h1>
      <div className="flex items-center gap-2">
        {status === "authenticated" && <HeaderBtn />}
      </div>
    </header>
  );
};
