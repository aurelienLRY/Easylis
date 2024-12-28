"use client";
import React, { useState } from "react";

/* Store */
import { useSessionWithDetails } from "@/store";

/* Components */
import { IconButton, SessionForm, AllSessionsCard } from "@/components";

/* Icons */
import { IoMdAddCircle } from "react-icons/io";

/**
 * SessionPage Component
 * @returns JSX.Element
 */
const SessionPage = () => {
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const sessionsWithDetails = useSessionWithDetails(
    (state) => state.SessionWithDetails
  );

  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="flex flex-row gap-4  justify-center items-center min-w-[280px] w-full max-w-[600px]">
        <IconButton
          title="Créer une session"
          icon={<IoMdAddCircle className="text-4xl" />}
          onClick={() => setIsOpenCreate(true)}
        />
      </div>
      <AllSessionsCard sessionsWithDetails={sessionsWithDetails} />
      <SessionForm
        isOpen={isOpenCreate}
        onClose={() => setIsOpenCreate(false)}
        data={undefined}
      />
    </div>
  );
};

export default SessionPage;
