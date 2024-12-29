"use client";

/* libraries */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

/* utils & types */
import { getSessionByStatus, countAllWaitingCustomers } from "@/utils";
import { useSessionWithDetails } from "@/store";
/* types */
interface NavLinkProps {
  href: string;
  label: string;
  count?: number;
}

/**
 * DashboardNav Component
 * Composant de navigation principal du tableau de bord
 * Affiche les liens de navigation et les compteurs de notifications
 *
 * @param {ISessionWithDetails[]} sessionsWithDetails - Les données des sessions avec leurs détails
 * @returns {JSX.Element} Composant de navigation
 */
export const DashboardNav = () => {
  const { SessionWithDetails } = useSessionWithDetails();
  const pathname = usePathname();

  // Calcul des compteurs de notifications
  const sessionPendingCount = getSessionByStatus(SessionWithDetails, "Pending");
  const customerWaitingCount = countAllWaitingCustomers(SessionWithDetails);

  /**
   * Vérifie si le chemin actuel correspond au lien
   * @param {string} path - Chemin à vérifier
   * @returns {boolean} True si le chemin est actif
   */
  const isActive = (path: string): boolean => pathname === path;

  /**
   * Génère les classes CSS pour le style des liens
   * @param {string} path - Chemin du lien
   * @returns {string} Classes CSS concatenées
   */
  const isPathActive = (path: string): string => {
    return cn(
      isActive(path) ? "font-semibold bg-sky-700 dark:bg-sky-900" : "",
      "py-2 px-4 min-h-10 min-w-15 rounded-md transition-all hover:font-semibold hover:bg-sky-600 relative flex justify-center items-center"
    );
  };

  /**
   * Composant pour afficher un lien de navigation avec compteur optionnel
   * @param {NavLinkProps} props - Propriétés du lien
   * @returns {JSX.Element} Lien de navigation
   */
  const NavLink = ({ href, label, count }: NavLinkProps) => (
    <Link href={href} className={isPathActive(href)}>
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 rounded-full text-white p-1 text-xs flex justify-center items-center opacity-80 z-40">
          {count}
        </span>
      )}
      {label}
    </Link>
  );

  return (
    <nav
      className="flex flex-col sm:flex-row justify-center items-center gap-1 md:gap-2
     bg-sky-950 dark:bg-sky-800 text-white text-xs font-light md:p-1 rounded-md 
     fixed md:relative bottom-11 md:translate-y-0 translate-y-1/2 py-2 w-full md:w-auto md:top-0 md:left-0 md:right-0 md:bottom-auto z-30"
    >
      <div className="flex relative">
        <NavLink href="/dashboard" label="Dashboard" />
        <NavLink
          href="/dashboard/session"
          label="Sessions"
          count={sessionPendingCount}
        />
        <NavLink
          href="/dashboard/booking"
          label="Réservations"
          count={customerWaitingCount}
        />
      </div>
      <div className="flex relative">
        <NavLink href="/dashboard/spot" label="Lieux" />
        <NavLink href="/dashboard/activity" label="Activités" />
      </div>
    </nav>
  );
};
