"use client";
/* Librairies */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tooltip } from "antd";
import { Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";

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
import { ISessionWithDetails } from "@/types";

/* hooks */
import { useModal } from "@/hooks";
import { useIsMobile } from "@/hooks/useMobile";

/* icons */
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

/**
 * Interface pour les props du composant AllSessionsCard
 */
interface AllSessionsCardProps {
  /** Liste des sessions avec leurs détails */
  sessionsWithDetails: ISessionWithDetails[];
}

/**
 * Calcule la plage de pagination
 * @param total - Nombre total de pages
 * @param current - Page courante
 * @returns Tableau des numéros de page à afficher
 */
const calculatePaginationRange = (total: number, current: number): number[] => {
  const range: number[] = [];
  const maxVisible = 5;

  if (total <= maxVisible) {
    for (let i = 0; i < total; i++) range.push(i);
  } else {
    const leftSide = Math.floor(maxVisible / 2);
    const rightSide = total - leftSide;

    if (current <= leftSide) {
      for (let i = 0; i < maxVisible - 1; i++) range.push(i);
      range.push(-1);
      range.push(total - 1);
    } else if (current >= rightSide) {
      range.push(0);
      range.push(-1);
      for (let i = total - (maxVisible - 1); i < total; i++) range.push(i);
    } else {
      range.push(0);
      range.push(-1);
      for (let i = current - 1; i <= current + 1; i++) range.push(i);
      range.push(-1);
      range.push(total - 1);
    }
  }
  return range;
};

/**
 * Hook personnalisé pour filtrer et trier les sessions
 * @param sessions - Liste des sessions à filtrer
 * @param filter - Type de filtre temporel
 * @param status - Statut des sessions à afficher
 * @param search - Terme de recherche
 * @returns Sessions filtrées et triées
 */
const useFilteredSessions = (
  sessions: ISessionWithDetails[],
  filter: string,
  status: string,
  search: string
): ISessionWithDetails[] => {
  return useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Tri des sessions par date
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Application des filtres
    const filteredSessions = sortedSessions.filter((session) => {
      const sessionDate = new Date(session.date);

      if (status && status !== "all" && session.status !== status) {
        return false;
      }

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
          return true;
      }
    });

    // Application de la recherche
    return search
      ? (SearchInObject(filteredSessions, search) as ISessionWithDetails[])
      : filteredSessions;
  }, [sessions, filter, status, search]);
};

/**
 * Composant AllSessionsCard - Affiche une liste de sessions avec filtrage et pagination
 * Fonctionnalités :
 * - Filtrage par période (semaine, mois, tout)
 * - Filtrage par statut
 * - Recherche textuelle
 * - Pagination avec navigation
 * - Adaptation du nombre d'items selon le device (3 sur mobile, 6 sur desktop)
 *
 * @param props - Les propriétés du composant
 * @returns JSX.Element
 */
export function AllSessionsCard({ sessionsWithDetails }: AllSessionsCardProps) {
  const [filter, setFilter] = useState<string>("all");
  const [status, setStatus] = useState<string>("Actif");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(0);

  // Utilisation du hook useIsMobile pour adapter le nombre d'items
  const isMobile = useIsMobile();
  const ITEMS_PER_PAGE = isMobile ? 3 : 6;

  const detailsModal = useModal<ISessionWithDetails>();
  const updateSessionModal = useModal<ISessionWithDetails>();
  const customerModal = useModal<ISessionWithDetails>();
  const canceledCustomerModal = useModal<ISessionWithDetails>();

  // Utilisation du hook personnalisé pour le filtrage
  const filteredSessions = useFilteredSessions(
    sessionsWithDetails,
    filter,
    status,
    search
  );
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);

  // Memoization des sessions de la page courante
  const currentSessions = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    return filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage, ITEMS_PER_PAGE]);

  // Gestion de la pagination
  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setSlideDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setSlideDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  // Calcul de la plage de pagination
  const paginationRange = useMemo(() => {
    return calculatePaginationRange(totalPages, currentPage);
  }, [totalPages, currentPage]);

  // Reset de la page courante lors du changement de filtre
  useEffect(() => {
    setCurrentPage(0);
  }, [filter, status, search]);

  if (!sessionsWithDetails.length) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center w-screen min-h-60">
        <p>Aucune session trouvée.</p>
      </div>
    );
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
        <div className="flex items-center justify-center gap-4 md:min-h-[540px] relative overflow-hidden">
          {totalPages > 1 && (
            <Tooltip title="Sessions précédentes">
              <button
                className="text-white hover:text-orange-600 rounded disabled:text-gray-300"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <FaChevronCircleLeft className="text-4xl h-10 w-10" />
              </button>
            </Tooltip>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ x: slideDirection * 1000, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection * 1000, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center overflow-hidden p-1"
            >
              {currentSessions.map((customerSession) => (
                <SessionCard
                  sessionWithDetails={customerSession}
                  key={customerSession._id}
                  detailsModal={detailsModal.openModal}
                  updateSessionModal={updateSessionModal.openModal}
                  addCustomerModal={customerModal.openModal}
                  canceledCustomerModal={canceledCustomerModal.openModal}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <Tooltip title="Sessions suivantes">
              <button
                className="text-white hover:text-orange-600 rounded disabled:text-gray-300"
                onClick={handleNextPage}
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
