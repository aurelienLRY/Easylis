"use client";
/* Libs */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { Spin } from "antd";
import { toast } from "sonner";
/* components */
import { SingOutBtn, Dashboard, EmailTemplateEditor } from "@/components";

/* Store */
import {
  useSessionWithDetails,
  useSpots,
  useActivities,
  useProfile,
  useCalendar,
} from "@/store";
import { useMailer } from "@/hooks/useMailer";

/**
 * Template Component
 * @param children: React.ReactNode
 * @returns JSX.Element
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the user status
  const { status } = useAuth();
  const mailer = useMailer();

  const sessionsWithDetails = useSessionWithDetails(
    (state) => state.SessionWithDetails
  );

  // If the user status is loading, return a loading message
  if (status === "loading" || isLoading) {
    return (
      <div className="flex gap-4 flex-col items-center justify-center h-screen">
        <Spin size="large" />
        <p>Chargement des données.</p>
      </div>
    );
  }

  return (
    <Dashboard sessionsWithDetails={sessionsWithDetails}>
      {children}

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
    </Dashboard>
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
