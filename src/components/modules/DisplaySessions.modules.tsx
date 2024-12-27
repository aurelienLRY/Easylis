"use client";
/* Librairies */
import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import { Spin } from "antd";

/* components */
import {
  SessionCard,
  SessionForm,
  CustomerSessionForm,
  CanceledCustomerSession,
  SessionDetailCard,
  ItemContainer,
} from "@/components";

/* Utils & types */
import { getSessionByStatus } from "@/utils";
import { SearchInObject } from "@/utils/search.utils";
import { cn } from "@/utils/cn";
import { ISessionWithDetails, ICustomerSession } from "@/types";

/* hooks */
import { useModal } from "@/hooks";
/* icons */
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

/**
 * AllSessionsCard Component
 * @param sessionsWithDetails: ISessionWithDetails[]
 * @returns  JSX.Element
 */
export function AllSessionsCard({
  sessionsWithDetails,
}: {
  sessionsWithDetails: ISessionWithDetails[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [filteredSessions, setFilteredSessions] = useState<
    ISessionWithDetails[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("Actif");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ITEMS_PER_PAGE = 6; // Nombre de sessions par page
  const [paginationRange, setPaginationRange] = useState<number[]>([]);

  const detailsModal = useModal<ISessionWithDetails>();
  const updateSessionModal = useModal<ISessionWithDetails>();
  const customerModal = useModal<ISessionWithDetails>();
  const canceledCustomerModal = useModal<ISessionWithDetails>();

  // Fonction pour calculer la plage de pagination
  const calculatePaginationRange = (total: number, current: number) => {
    const range: number[] = [];
    const maxVisible = 5; // Nombre maximum de dots visibles

    if (total <= maxVisible) {
      // Afficher tous les dots si le total est inférieur au maximum
      for (let i = 0; i < total; i++) range.push(i);
    } else {
      // Logique pour les dots avec ellipsis
      const leftSide = Math.floor(maxVisible / 2);
      const rightSide = total - leftSide;

      if (current <= leftSide) {
        // Début de la pagination
        for (let i = 0; i < maxVisible - 1; i++) range.push(i);
        range.push(-1); // Ellipsis
        range.push(total - 1);
      } else if (current >= rightSide) {
        // Fin de la pagination
        range.push(0);
        range.push(-1); // Ellipsis
        for (let i = total - (maxVisible - 1); i < total; i++) range.push(i);
      } else {
        // Milieu de la pagination
        range.push(0);
        range.push(-1); // Ellipsis gauche
        for (let i = current - 1; i <= current + 1; i++) range.push(i);
        range.push(-1); // Ellipsis droite
        range.push(total - 1);
      }
    }
    return range;
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSessions = filteredSessions.slice(startIndex, endIndex);

  useEffect(() => {
    setIsLoading(sessionsWithDetails.length === 0);
    const sortedSessions = [...sessionsWithDetails].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const resultFilter = filterSessions(sortedSessions, filter, status);
    const resultSearch = SearchInObject(resultFilter, search);
    setFilteredSessions(resultSearch as ISessionWithDetails[]);

    // Mise à jour de la plage de pagination
    setPaginationRange(calculatePaginationRange(totalPages, currentPage));
  }, [
    filter,
    sessionsWithDetails,
    status,
    search,
    filteredSessions.length,
    currentPage,
    totalPages,
  ]);

  if (isLoading || sessionsWithDetails.length === 0) {
    if (sessionsWithDetails.length === 0) {
      return (
        <div className="flex flex-col gap-4 justify-center items-center w-screen min-h-60 ">
          <p>Aucune session trouvée.</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-4 justify-center items-center w-screen min-h-60 ">
          <Spin size="large" />
          <p>Chargement des données.</p>
        </div>
      );
    }
  }

  return (
    <ItemContainer>
      <div className="flex flex-col gap-4 w-full min-h-60 rounded-md px-2 md:px-4 py-6">
        {/* filter NAV */}
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-4 items-center w-full mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* filter Période */}
            <div className="flex gap-0 flex-col  items-center md:items-start  md:justify-center ">
              <div className=" text-lg text-start ms-2 opacity-50">Période</div>
              <div className="flex justify-center gap-4 text-xs min-h-6 font-light bg-sky-950 dark:bg-sky-800 rounded-md py-2 px-4 box-content max-w-fit">
                <button
                  className={cn(
                    "px-2 rounded-md",
                    filter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={cn(
                    "px-2 rounded-md",
                    filter === "thisMonth"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setFilter("thisMonth")}
                >
                  This month
                </button>{" "}
                <button
                  className={cn(
                    "px-2 rounded-md",
                    filter === "thisWeek"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setFilter("thisWeek")}
                >
                  This week
                </button>
              </div>
            </div>
            {/* filter Statut */}
            <div className="flex gap-0 flex-col  items-center md:items-start  md:justify-center ">
              <div className=" text-lg text-start ms-2 opacity-50">Statut</div>
              <div className="flex justify-center gap-4 text-xs min-h-6 font-light bg-sky-950 dark:bg-sky-800 rounded-md py-2 px-4 box-content max-w-fit">
                <button
                  className={cn(
                    "px-2 rounded-md",
                    status === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setStatus("all")}
                >
                  All
                </button>
                <button
                  className={cn(
                    "px-2 rounded-md",
                    status === "Actif"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setStatus("Actif")}
                >
                  Active
                </button>
                {/* pending */}
                <button
                  className={cn(
                    "px-2 rounded-md relative",
                    status === "Pending"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setStatus("Pending")}
                >
                  en attente
                  {getSessionByStatus(sessionsWithDetails, "Pending") > 0 && (
                    <span className="absolute -top-3 -right-2 w-5 h-5 bg-orange-600 rounded-full text-white text-xs flex justify-center items-center">
                      {getSessionByStatus(sessionsWithDetails, "Pending")}
                    </span>
                  )}
                </button>

                <button
                  className={cn(
                    "px-2 rounded-md",
                    status === "Archived"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                  onClick={() => setStatus("Archived")}
                >
                  Archivée
                </button>
              </div>
            </div>
          </div>

          {/* search */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="🔎 Recherche"
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 bg-white py-2 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Grille des sessions avec navigation */}
        <div className="flex items-center justify-center gap-4 md:min-h-[540px] relative">
          {totalPages > 1 && (
            <Tooltip title="Sessions précédentes">
              <button
                className="  text-white hover:text-orange-600 rounded disabled:text-gray-300"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <FaChevronCircleLeft className="text-4xl h-10 w-10" />
              </button>
            </Tooltip>
          )}

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-4 justify-items-center">
            {currentSessions.map((session: ISessionWithDetails) => (
              <SessionCard
                sessionWithDetails={session}
                key={session._id}
                detailsModal={detailsModal.openModal}
                updateSessionModal={updateSessionModal.openModal}
                addCustomerModal={customerModal.openModal}
                canceledCustomerModal={canceledCustomerModal.openModal}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Tooltip title="Sessions suivantes">
              <button
                className=" text-white hover:text-orange-600 rounded disabled:text-gray-300"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage >= totalPages - 1}
              >
                <FaChevronCircleRight className="text-4xl h-10 w-10" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Dots de pagination améliorés */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center gap-2 my-4">
            {paginationRange.map((pageNumber, index) => (
              <React.Fragment key={index}>
                {pageNumber === -1 ? (
                  <span className="w-3 text-white opacity-50">...</span>
                ) : (
                  <Tooltip title={`Aller à la page ${pageNumber + 1}`}>
                    <button
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 border-2 ${
                        currentPage === pageNumber
                          ? "bg-orange-600 border-orange-600"
                          : "border-white hover:border-orange-600"
                      }`}
                      aria-label={`Aller à la page ${pageNumber + 1}`}
                    >
                      <span className="sr-only">Page {pageNumber + 1}</span>
                    </button>
                  </Tooltip>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

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
    </ItemContainer>
  );
}

/**
 * filterSessions
 * @param sessions ISessionWithDetails[]
 * @param filter string
 * @param status string
 * @returns ISessionWithDetails[]
 */
function filterSessions(
  sessions: ISessionWithDetails[],
  filter: string,
  status?: string
) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return sessions.filter((session: ISessionWithDetails) => {
    const sessionDate = new Date(session.date);

    // Filtrer par statut si spécifié
    if (status && status !== "all" && session.status !== status) {
      return false;
    }

    // Filtrer par période
    switch (filter) {
      case "thisWeek":
        return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return sessionDate >= startOfMonth && sessionDate <= endOfMonth;
      case "past":
        return sessionDate < now;
      default:
        return true; // Pour le filtre "all" ou tout autre cas non spécifié
    }
  });
}
