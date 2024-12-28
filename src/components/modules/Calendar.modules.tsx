"use client";
/* libraries */
import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Tooltip } from "antd";

/* fullcalendar */
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import timeGridPlugin from "@fullcalendar/timegrid";
import frLocale from "@fullcalendar/core/locales/fr";

/* components */
import {
  ItemContainer,
  SecondaryButton,
  LoadingSpinner,
  RefreshButton,
} from "@/components";

/* stores */
import { useProfile, useCalendar } from "@/store";

type Props = {
  className?: string;
};

export const CalendarCard = (props: Props) => {
  const { tokenIsValid, isLoading } = useCalendar();

  return (
    <ItemContainer
      className={`min-w-[300px] w-full min-h-[200px] p-2 ${props.className}`}
    >
      {isLoading ? (
        <LoadingSpinner text="Chargement du calendrier..." />
      ) : tokenIsValid ? (
        <Calendar />
      ) : (
        <ConnectToCalendar />
      )}
    </ItemContainer>
  );
};

/**
 * Composant qui retourne les élément pour se connecter
 * @returns {JSX.Element}
 */
const ConnectToCalendar = () => {
  const pathname = usePathname(); // Obtenir l'URL actuelle
  const router = useRouter();
  const googleCalendarConnect = async () => {
    await fetch(`/api/services/google?origin=${encodeURIComponent(pathname)}`)
      .then((res) => res.json())
      .then((data) => {
        router.push(data.authUrl);
      });
  };
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center ">
        <Image
          src="/img/googleCalendar.png"
          alt="Google Calendar"
          width={500}
          height={500}
          className="w-20 h-20 object-contain"
        />
        <h2 className="text-2xl font-bold">Mon calendrier Google</h2>
        <p className="text-sm text-slate-300 lg:max-w-[2/3]">
          Connectez votre calendrier Google pour synchroniser vos événements.
        </p>
      </div>
      <SecondaryButton onClick={googleCalendarConnect} className="px-4 py-2 ">
        Connecter mon calendrier
      </SecondaryButton>
    </div>
  );
};

function Calendar() {
  const { profile } = useProfile();
  const { checkTokenValidity } = useCalendar();
  if (!profile) return null;
  return (
    <div className="h-full w-full flex flex-col gap-4  justify-around min-w-[350px]">
      <FullCalendar
        locale="fr"
        locales={[frLocale]}
        plugins={[dayGridPlugin, googleCalendarPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={{
          googleCalendarId: profile.email,
          className: "bg-orange-600 text-sm w-full h-fit",
        }}
        googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY}
        themeSystem="Cosmo"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        titleFormat={{ day: "numeric", month: "short", year: "numeric" }}
        //contentHeight="500px"
        aspectRatio={1.4}
        scrollTime="08:00:00 "
      />
      <div className=" w-full flex justify-end items-center px-2 text-slate-400">
        <RefreshButton
          onClick={checkTokenValidity}
          title="Rafraîchir le calendrier"
        />
      </div>
    </div>
  );
}
