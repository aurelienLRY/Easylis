"use client";
import React from "react";
import {
  SessionForm,
  CustomerSessionForm,
  CanceledCustomerSession,
  CalendarCard,
  SessionDetailCard,
  SessionCard,
  ItemContainer,
  YearlyStats,
  MonthlyStats,
  FavorisSpots,
  FavorisActivities,
  SessionPhotosModal,
} from "@/components";

/* Utils */
import { filterSessionsForDashboard } from "@/utils";

/* Store & Types */
import { useSessionWithDetails } from "@/store";
import { ISessionWithDetails } from "@/types";
import { useModal } from "@/hooks";

/**
 * Dashboard Component
 * Main dashboard view displaying upcoming sessions, statistics and calendar
 */
const Dashboard = () => {
  // Get sessions data from global store
  const sessionsWithDetails = useSessionWithDetails(
    (state) => state.SessionWithDetails
  );

  // Filter sessions for dashboard display
  const filteredSessions = filterSessionsForDashboard(sessionsWithDetails);

  // Modal states for various actions
  const detailsModal = useModal<ISessionWithDetails>();
  const updateSessionModal = useModal<ISessionWithDetails>();
  const customerModal = useModal<ISessionWithDetails>();
  const canceledCustomerModal = useModal<ISessionWithDetails>();
  const photoModal = useModal<ISessionWithDetails>();

  return (
    <section className="w-full md:p-4 flex flex-col gap-12 items-center">
      {/* Upcoming Sessions Section */}
      <UpcomingSessions
        filteredSessions={filteredSessions}
        modals={{
          detailsModal,
          updateSessionModal,
          customerModal,
          canceledCustomerModal,
          photoModal,
        }}
      />

      {/* Modal Details */}
      {detailsModal.data && (
        <SessionDetailCard
          data={detailsModal.data}
          isOpen={detailsModal.isOpen}
          onClose={detailsModal.closeModal}
        />
      )}
      {/* Modal Update */}
      {updateSessionModal.data && (
        <SessionForm
          data={updateSessionModal.data}
          isOpen={updateSessionModal.isOpen}
          onClose={updateSessionModal.closeModal}
        />
      )}
      {/* Modal Customer */}
      {customerModal.data && (
        <CustomerSessionForm
          session={customerModal.data}
          isOpen={customerModal.isOpen}
          onClose={customerModal.closeModal}
        />
      )}
      {/* Modal Canceled Customer */}
      {canceledCustomerModal.data && (
        <CanceledCustomerSession
          data={canceledCustomerModal.data}
          isOpen={canceledCustomerModal.isOpen}
          onClose={canceledCustomerModal.closeModal}
        />
      )}
      {photoModal.data && (
        <SessionPhotosModal
          data={photoModal.data}
          isOpen={photoModal.isOpen}
          onClose={photoModal.closeModal}
        />
      )}
      {/* Statistics Section */}
      <StatisticsSection sessionsWithDetails={sessionsWithDetails} />
    </section>
  );
};

export default Dashboard;

/**
 * Displays motivational messages based on number of sessions
 */
const DisplayHeaderMessage = (n: number) => {
  const messages = {
    1: { emoji: "🚀", text: "Lets Go !!" },
    2: { emoji: "🚀🚀", text: "Tu fais du bon boulot 🔥" },
    3: { emoji: "🚀🚀🚀", text: "Tu es un machine 🤖" },
    4: {
      emoji: "🔥",
      text: "C'est le Feu! ",
    },
  };

  const message = messages[Math.min(n, 4) as keyof typeof messages];
  return (
    <p className="text-xl font-bold opacity-50">
      <span className="text-4xl">{message.emoji}</span> {message.text}
    </p>
  );
};

/**
 * Upcoming Sessions Component
 * Displays the list of upcoming sessions with action modals
 */
interface UpcomingSessionsProps {
  filteredSessions: ISessionWithDetails[];
  modals: {
    detailsModal: any;
    updateSessionModal: any;
    customerModal: any;
    canceledCustomerModal: any;
    photoModal: any;
  };
}

const UpcomingSessions = ({
  filteredSessions,
  modals,
}: UpcomingSessionsProps) => (
  <article className="w-full md:p-4 flex flex-col gap-12 items-center">
    <div className="w-full flex flex-col xl:flex-row gap-4">
      <ItemContainer title="Mes sessions à venir" className="items-center">
        {filteredSessions.length === 0 ? (
          <EmptySessionsMessage />
        ) : (
          <SessionsList sessions={filteredSessions} modals={modals} />
        )}
      </ItemContainer>
      <CalendarCard />
    </div>
  </article>
);

/**
 * Empty Sessions Message Component
 */
const EmptySessionsMessage = () => (
  <div className="flex flex-col gap-4 justify-center items-center h-full">
    <p className="text-xl font-bold">
      <span className="text-4xl">🤷</span> Aucune session à venir
    </p>
    <p className="text-4xl font-bold">
      Vacances 🏖️ <span className="text-xl">ou</span> Prospection 🔍 ❓
    </p>
  </div>
);

/**
 * Statistics Section Component
 * Displays various statistics about sessions
 */
interface StatisticsSectionProps {
  sessionsWithDetails: ISessionWithDetails[];
}

const StatisticsSection = ({ sessionsWithDetails }: StatisticsSectionProps) => (
  <article className="w-full md:p-4 flex flex-col gap-12 items-center">
    <h2 className="text-4xl font-bold">Mes statistiques</h2>
    <div className="w-full flex flex-col md:flex-row gap-4">
      <YearlyStats />
      <MonthlyStats />
    </div>
    <div className="w-full flex flex-col md:flex-row gap-4">
      <FavorisSpots />
      <FavorisActivities />
    </div>
  </article>
);

/**
 * Sessions List Component
 * Displays a grid of session cards with their actions
 */
interface SessionsListProps {
  sessions: ISessionWithDetails[];
  modals: {
    detailsModal: any;
    updateSessionModal: any;
    customerModal: any;
    canceledCustomerModal: any;
    photoModal: any;
  };
}

const SessionsList = ({ sessions, modals }: SessionsListProps) => (
  <>
    {DisplayHeaderMessage(sessions.length)}
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
      {sessions.map((session) => (
        <SessionCard
          key={session._id}
          sessionWithDetails={session}
          detailsModal={modals.detailsModal.openModal}
          updateSessionModal={modals.updateSessionModal.openModal}
          addCustomerModal={modals.customerModal.openModal}
          canceledCustomerModal={modals.canceledCustomerModal.openModal}
          photoModal={modals.photoModal.openModal}
        />
      ))}
    </div>
  </>
);
