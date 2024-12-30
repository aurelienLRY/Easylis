"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Tooltip } from "antd";
import { motion, AnimatePresence } from "framer-motion";
// Import Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

/* store */
import { useSessionWithDetails } from "@/store";

/* COMPONENTS */
import {
  CustomerBookingTable,
  CustomerSessionForm,
  CustomerFiche,
  ItemContainer,
} from "@/components";

/*Hook*/
import { useModal, useMailer, useIsMobile } from "@/hooks";

/* types */
import { ICustomerSession, ISessionWithDetails } from "@/types";

/* utils */
import { getMonthValue, SearchInObject } from "@/utils";

/* icons */
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

// Définition du type pour les sessions triées
type SortedSessions = {
  [year: number]: {
    [month: number]: ISessionWithDetails[];
  };
};

/**
 * Composant pour afficher les réservations en mode desktop
 */
const DesktopView = ({
  currentMonths,
  filteredSession,
  handlePrevPage,
  handleNextPage,
  totalPages,
  currentPage,
  slideDirection,
  modals,
}: {
  currentMonths: { year: number; month: number }[];
  filteredSession: SortedSessions;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  totalPages: number;
  currentPage: number;
  slideDirection: number;
  modals: {
    detailCustomerModal: ReturnType<typeof useModal<ICustomerSession>>;
    editCustomer: ReturnType<
      typeof useModal<{ data: ICustomerSession; session: ISessionWithDetails }>
    >;
  };
}) => (
  <div className="flex items-center justify-center md:min-h-[700px]">
    {totalPages > 1 && (
      <Tooltip title="Mois précédents">
        <button
          className="max-w-1/6 flex justify-end text-white hover:text-orange-600 rounded disabled:text-gray-300"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <FaChevronCircleLeft className="text-4xl h-10 w-10" />
        </button>
      </Tooltip>
    )}

    <div className="w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ x: slideDirection * 1000, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideDirection * -1000, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col gap-6 w-full items-center"
        >
          {currentMonths.map(({ year, month }) => (
            <MonthSection
              key={`${year}-${month}`}
              year={year}
              month={month}
              filteredSession={filteredSession}
              modals={modals}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>

    {totalPages > 1 && (
      <Tooltip title="Mois suivants">
        <button
          className="max-w-1/6 flex justify-end text-white hover:text-orange-600 rounded disabled:text-gray-300"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1}
        >
          <FaChevronCircleRight className="text-4xl h-10 w-10" />
        </button>
      </Tooltip>
    )}
  </div>
);

/**
 * Composant pour afficher les réservations en mode mobile avec Swiper
 */
const MobileView = ({
  monthsWithData,
  filteredSession,
  currentPage,
  setCurrentPage,
  modals,
}: {
  monthsWithData: { year: number; month: number }[];
  filteredSession: SortedSessions;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  modals: {
    detailCustomerModal: ReturnType<typeof useModal<ICustomerSession>>;
    editCustomer: ReturnType<
      typeof useModal<{ data: ICustomerSession; session: ISessionWithDetails }>
    >;
  };
}) => {
  return (
    <Swiper
      modules={[Pagination]}
      pagination={{ clickable: true }}
      onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex)}
      initialSlide={currentPage}
      className="w-full min-h-[300px]"
      noSwipingClass="swiper-no-swiping"
      noSwiping={true}
      nested={true}
    >
      {monthsWithData.map(({ year, month }) => (
        <SwiperSlide key={`${year}-${month}`}>
          <MonthSection
            year={year}
            month={month}
            filteredSession={filteredSession}
            modals={modals}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

/**
 * Composant réutilisable pour afficher une section de mois
 */
const MonthSection = ({
  year,
  month,
  filteredSession,
  modals,
}: {
  year: number;
  month: number;
  filteredSession: SortedSessions;
  modals: {
    detailCustomerModal: ReturnType<typeof useModal<ICustomerSession>>;
    editCustomer: ReturnType<
      typeof useModal<{ data: ICustomerSession; session: ISessionWithDetails }>
    >;
  };
}) => (
  <div className="flex flex-col gap-6 min-w-[350px] w-full max-w-[1500px] p-4">
    <div className="flex flex-col gap-2 items-center md:items-start">
      <h2 className="text-4xl font-bold">
        {getMonthValue(month)}{" "}
        <span className="text-xl font-normal text-gray-500">{year}</span>
      </h2>
      <div className="flex flex-col gap-2 w-full">
        {filteredSession[year]?.[month]?.map(
          (sessionWithDetails: ISessionWithDetails, index: number) =>
            sessionWithDetails.customerSessions.length >= 1 && (
              <CustomerBookingTable
                key={index}
                data={sessionWithDetails}
                customerFiche={modals.detailCustomerModal.openModal}
                editCustomer={modals.editCustomer.openModal}
              />
            )
        )}
      </div>
    </div>
  </div>
);

const getQuarterDates = (date: Date) => {
  const currentQuarter = Math.floor(date.getMonth() / 3);
  const quarters = [];

  for (let i = 0; i < 4; i++) {
    const startMonth = ((currentQuarter + i) % 4) * 3;
    const year = date.getFullYear() + Math.floor((currentQuarter + i) / 4);
    quarters.push({
      label: `${getMonthValue(startMonth).substring(0, 3)}-${getMonthValue(
        startMonth + 2
      ).substring(0, 3)} ${year}`,
      startMonth,
      endMonth: startMonth + 2,
      year,
    });
  }
  return quarters;
};

/**
 * Fonction utilitaire pour générer les classes des boutons de filtre
 */
const getButtonClassName = (isActive: boolean) => {
  const baseClass = "px-3 py-1 rounded-md transition-all";
  const activeClass = "bg-blue-500 text-white";
  const inactiveClass = "bg-gray-200 text-gray-500 hover:bg-gray-300";

  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
};

const BookingPage = () => {
  const isMobile = useIsMobile();
  const ITEMS_PER_PAGE = isMobile ? 1 : 3; // 1 mois par page sur mobile, 3 sur desktop

  const mailer = useMailer();
  const { SessionWithDetails: sessionWithDetails } = useSessionWithDetails();
  const [filteredSession, setFilteredSession] = useState<SortedSessions>({});
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [monthsWithData, setMonthsWithData] = useState<
    { year: number; month: number }[]
  >([]);
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [slideDirection, setSlideDirection] = useState<number>(0);

  type TEditData = {
    data: ICustomerSession;
    session: ISessionWithDetails;
  };
  const editCustomer = useModal<TEditData>();
  const detailCustomerModal = useModal<ICustomerSession>();

  const modals = {
    editCustomer,
    detailCustomerModal,
  };

  // Fonction de tri des sessions par mois et année
  function getSortedSessionByMonthAndYear(
    sessions: ISessionWithDetails[]
  ): SortedSessions {
    return sessions.reduce(
      (acc: SortedSessions, session: ISessionWithDetails) => {
        const date = new Date(session.date);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (!acc[year]) acc[year] = {};
        if (!acc[year][month]) acc[year][month] = [];

        acc[year][month].push(session);
        return acc;
      },
      {}
    );
  }

  // Fonction pour filtrer par période
  const filterByPeriod = useCallback(
    (sessions: ISessionWithDetails[]): ISessionWithDetails[] => {
      const now = new Date();
      const quarters = getQuarterDates(now);

      return sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        const sessionMonth = sessionDate.getMonth();
        const sessionYear = sessionDate.getFullYear();

        if (periodFilter === "all") return true;
        if (periodFilter === "thisMonth") {
          return (
            sessionMonth === now.getMonth() && sessionYear === now.getFullYear()
          );
        }

        // Trouve le trimestre correspondant au filtre
        const selectedQuarter = quarters.find((q) => q.label === periodFilter);
        if (selectedQuarter) {
          return (
            sessionYear === selectedQuarter.year &&
            sessionMonth >= selectedQuarter.startMonth &&
            sessionMonth <= selectedQuarter.endMonth
          );
        }

        return true;
      });
    },
    [periodFilter]
  );

  useEffect(() => {
    const sortSession = [...sessionWithDetails].sort(
      (a: ISessionWithDetails, b: ISessionWithDetails) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const filteredByPeriod = filterByPeriod(sortSession);
    const searchSession = SearchInObject(filteredByPeriod, search);
    const sorted = getSortedSessionByMonthAndYear(
      searchSession as ISessionWithDetails[]
    );
    setFilteredSession(sorted);

    // Créer un tableau des mois ayant des données
    const months: { year: number; month: number }[] = [];
    Object.entries(sorted).forEach(([yearStr, yearData]) => {
      const year = parseInt(yearStr);
      Object.entries(yearData).forEach(([monthStr, monthData]) => {
        const month = parseInt(monthStr);
        if (monthData.some((session) => session.customerSessions.length >= 1)) {
          months.push({ year, month });
        }
      });
    });

    setMonthsWithData(
      months.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
    );
  }, [sessionWithDetails, search, periodFilter, filterByPeriod]);

  // Calculer les indices de pagination
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMonths = monthsWithData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(monthsWithData.length / ITEMS_PER_PAGE);

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

  const quarters = getQuarterDates(new Date());

  return (
    <ItemContainer>
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Filtre par période */}
        <div className="flex flex-col items-start w-full md:w-auto">
          <div className="text-lg opacity-50 mb-2">Période</div>
          <div className="flex flex-wrap justify-center gap-2 text-xs font-light bg-sky-950 dark:bg-sky-800 rounded-md py-2 px-4 w-full md:w-auto">
            <button
              className={getButtonClassName(periodFilter === "all")}
              onClick={() => setPeriodFilter("all")}
            >
              Toutes
            </button>
            <button
              className={getButtonClassName(periodFilter === "thisMonth")}
              onClick={() => setPeriodFilter("thisMonth")}
            >
              Ce mois
            </button>
            {quarters.map((quarter) => (
              <button
                key={quarter.label}
                className={getButtonClassName(periodFilter === quarter.label)}
                onClick={() => setPeriodFilter(quarter.label)}
              >
                {quarter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center w-full md:w-auto">
          <input
            type="text"
            placeholder="🔎 Recherche"
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200 w-full md:w-auto"
          />
        </div>
      </div>

      {/* Vue conditionnelle selon le device */}
      {isMobile ? (
        <MobileView
          monthsWithData={monthsWithData}
          filteredSession={filteredSession}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          modals={modals}
        />
      ) : (
        <DesktopView
          currentMonths={currentMonths}
          filteredSession={filteredSession}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          totalPages={totalPages}
          currentPage={currentPage}
          slideDirection={slideDirection}
          modals={modals}
        />
      )}

      {/* Pagination dots seulement pour desktop */}
      {!isMobile && totalPages > 1 && (
        <div className="w-full flex justify-center gap-2 my-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Tooltip title={`Aller à la page ${index + 1}`} key={index}>
              <button
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 border-2 ${
                  currentPage === index
                    ? "bg-orange-600 border-orange-600"
                    : "border-white hover:border-orange-600"
                }`}
                aria-label={`Aller à la page ${index + 1}`}
              >
                <span className="sr-only">Page {index + 1}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Modals */}
      {editCustomer.data && (
        <CustomerSessionForm
          isOpen={editCustomer.isOpen}
          onClose={editCustomer.closeModal}
          data={editCustomer.data.data}
          session={editCustomer.data.session}
        />
      )}

      {detailCustomerModal.data && (
        <CustomerFiche
          customer={detailCustomerModal.data}
          onClose={detailCustomerModal.closeModal}
          isOpen={detailCustomerModal.isOpen}
        />
      )}
    </ItemContainer>
  );
};

export default BookingPage;
