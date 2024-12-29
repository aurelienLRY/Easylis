"use client";

/* Components */
import { HeaderBtn } from "@/components";
import { useSession } from "next-auth/react";
import Image from "next/image";

/**
 * Header Component
 * @returns {JSX.Element} Le composant barre de navigation.
 */
export const Header = () => {
  const { status } = useSession();
  return (
    <header className="flex justify-between items-center p-3  lg:px-10 md:fixed top-0 w-full z-40 bg-slate-900 dark:bg-sky-950 text-white bg-opacity-60 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Image
          src="/img/Easylis.png"
          alt="logo"
          width={100}
          height={100}
          className="w-10 h-10 "
        />
        <h1 className="text-4xl ">
          {process.env.NEXT_PUBLIC_BRANDING_NAME || "Easylis"}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {status === "authenticated" && <HeaderBtn />}
      </div>
    </header>
  );
};
