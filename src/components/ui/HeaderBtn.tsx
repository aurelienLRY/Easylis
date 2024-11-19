"use client";

/* Libs */
import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hook";
import { Tooltip } from "antd";
import { Skeleton } from "@nextui-org/skeleton";

/* components*/
import { ItemCard, ItemCardHeader, ThemeToggle } from "@/components";

/* utils*/
import { cn, checkAvatarExists } from "@/utils";
/* icons*/
import { MdAdminPanelSettings } from "react-icons/md";
import { SiAuthelia } from "react-icons/si";
import { FaCalendarCheck } from "react-icons/fa";
import { FaCalendarXmark } from "react-icons/fa6";

type Props = {};

export const HeaderBtn = ({}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/img/default-avatar.webp"
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const { status, session } = useAuth();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (session?.user?.avatar) {
      setAvatarUrl(`/${session?.user?.avatar}`);
    }
  }, [session]);

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip title="Menu utilisateur">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer rounded-full border-4  border-transparent hover:border-opacity-40 hover:border-sky-500 transition-all duration-300"
        >
          <Suspense fallback={<SkeletonAvatar />}>
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={40}
              height={40}
              className=" rounded-full "
            />
          </Suspense>
        </div>
      </Tooltip>
      {isOpen && (
        <ItemCard className="absolute right-0 mt-2 min-w-48 w-[80vw]  max-w-[400px] flex flex-col gap-4">
          <ItemCardHeader className="flex flex-col justify-center items-center relative">
            <h3 className=" font-bold min-h-[50px]">
              {session?.user?.username}
            </h3>
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={70}
              height={70}
              className=" rounded-full absolute bottom-[-30px]  "
            />
          </ItemCardHeader>
          <div className="display flex flex-col gap-2 items-center justify-center mt-8">
            <div className="flex flex-col items-center justify-center">
              <p className="text-lg font-bold">
                {session?.user.lastName} {session?.user?.firstName}
              </p>
              <p className="text-sm text-gray-300 font-extralight italic">
                {session?.user?.email}
              </p>
            </div>
            <div className="   flex items-center justify-center gap-3 md:px-5">
              <ThemeToggle />
              <Tooltip
                title={
                  status === "authenticated" ? "Authentifié" : "Non authentifié"
                }
              >
                <SiAuthelia
                  className={cn(
                    status === "authenticated"
                      ? " text-green-500"
                      : " text-red-500",
                    "text-2xl"
                  )}
                />
              </Tooltip>
              {session?.user?.calendar ? (
                <FaCalendarCheck className="text-2xl text-green-500" />
              ) : (
                <FaCalendarXmark className="text-2xl text-red-500" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 mb-4 ">
            <Link
              href="/dashboard/account"
              className=" px-4  text-gray-400 flex items-center gap-2 hover:text-gray-200 transition-all duration-300 font-light"
              onClick={() => setIsOpen(false)}
            >
              <MdAdminPanelSettings className="text-xl" />
              Gérer mon compte
            </Link>
            {/* TODO: add setting page */}
            {/* <Link
              href="/dashboard/setting"
              className=" px-4  text-gray-400 flex items-center gap-2 hover:text-gray-200 transition-all duration-300 font-light"
              onClick={() => setIsOpen(false)}
            >
              <MdAppSettingsAlt className="text-xl" />
              Gérer mes préférences
            </Link> */}
          </div>
        </ItemCard>
      )}
    </div>
  );
};

const SkeletonAvatar = () => {
  return <Skeleton className="flex rounded-full w-12 h-12" />;
};
