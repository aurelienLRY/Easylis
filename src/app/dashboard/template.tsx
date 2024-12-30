"use client";
/* Libs */
import React, { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";

import { toast } from "sonner";
/* components */
import {
  SingOutBtn,
  DashboardNav,
  LoadingSpinner,
  EmailTemplateEditor,
} from "@/components";

/* Store */
import {
  useSpots,
  useActivities,
  useProfile,
  useCalendar,
  useSessionWithDetails,
} from "@/store";
import { useMailer } from "@/hooks/useMailer";
import { usePathname } from "next/navigation";

// const EmailTemplateEditor = dynamic(
//   () =>
//     import("@/components/modules/MailerEditor.modules").then(
//       (mod) => mod.EmailTemplateEditor
//     ),
//   {
//     ssr: false,
//   }
// );

/**
 * Template Component
 * @param children: React.ReactNode
 * @returns JSX.Element
 */
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          useProfile.getState().fetchProfile(),
          useSessionWithDetails.getState().fetchSessionWithDetails(),
          useSpots.getState().fetchSpots(),
          useActivities.getState().fetchActivities(),
        ]);
        useCalendar.getState().initialize();
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, []);

  // Get the user status
  const mailer = useMailer();
  const pathname = usePathname();

  return (
    <div className="w-full flex flex-col items-start px-1 md:px-4 py-6 ">
      <div className="w-full flex flex-col gap-1 items-center md:items-start md:px-6 mb-4">
        <h1 className="text-4xl font-bold">{getPathname(pathname)}</h1>
        <DashboardNav />
      </div>
      <Suspense fallback={<LoadingSpinner className="h-screen" />}>
        {children}
      </Suspense>
      {/* SingOutBtn */}
      <SingOutBtn />
      {/* Email Template Editor */}
      <EmailTemplateEditor
        isSubmitting={mailer.isSubmitting}
        isOpen={mailer.isEditorOpen}
        Mail={mailer.initialEmailContent}
        EmailContent={mailer.handleEmailContent}
        onSend={async () => {
          await mailer.sendEmail();
          if (mailer.queuedEmails.length > 0) {
            const nextEmail = mailer.processNextEmail();
            if (nextEmail) {
              toast.success(
                "Email envoyé avec succès. Préparation du prochain email..."
              );
            } else {
              toast.success("Tous les emails ont été envoyés avec succès");
            }
          }
        }}
        onClose={mailer.closeEditor}
      />
    </div>
  );
}

export const getPathname = (pathname: string) => {
  switch (pathname) {
    case "/dashboard":
      return "Dashboard";
    case "/dashboard/session":
      return "Sessions";
    case "/dashboard/booking":
      return "Réservations";
    case "/dashboard/spot":
      return "Lieux";
    case "/dashboard/activity":
      return "Activités";
    case "/dashboard/email":
      return "Email";
    case "/dashboard/account":
      return "Mon compte";
    case "/dashboard/setting":
      return "Paramètres";
    default:
      return "Dashboard";
  }
};
