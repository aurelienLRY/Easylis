import { ICustomerSession, ISessionWithDetails } from "@/types";

/**
 * Vérifie si tous les clients sont annulés
 * @param {ICustomerSession[]} data - Liste des sessions clients
 * @returns {boolean} - Retourne vrai si tous les clients sont annulés, sinon faux
 */
export const customerIsCancelled = (data: ICustomerSession[]) =>
  data.every((cs) => cs.status === "Canceled");

/**
 * Compte le nombre de clients en attente
 * @param {ICustomerSession[]} data - Liste des sessions clients
 * @returns {number} - Retourne le nombre de clients en attente
 */
export const customerWaitingCount = (data: ICustomerSession[]) =>
  data.filter((cs: ICustomerSession) => cs.status === "Waiting").length;

/**
 * Vérifie si un client est en attente
 * @param {ICustomerSession[]} data - Liste des sessions clients
 * @returns {boolean} - Retourne vrai si un client est en attente, sinon faux
 */
export const customerIsWaiting = (data: ICustomerSession[]) =>
  data.some((cs: ICustomerSession) => cs.status === "Waiting");

interface StatusDisplay {
  icon: string;
  name: string;
}

/**
 * Retourne l'icône et le label associés au statut du client
 * @param {string} status - Statut du client
 * @returns {{ icon: string, name: string }} - Objet contenant l'icône et le label associés au statut
 */
export const getCustomerStatusDisplay = (status: string) => {
  const displayStatus: Record<string, StatusDisplay> = {
    Validated: { icon: "👍", name: "Validé" },
    Canceled: { icon: "🖕", name: "Annulé" },
    Waiting: { icon: "🕒", name: "En attente" },
  };

  return displayStatus[status] || { icon: "❓", name: "Inconnu" };
};

/**
 * Affiche une équivalence pour l'UI en fonction de la customerSession.typeOfReservation
 * @param {string} typeOfReservation - Le type de réservation
 * @returns {string} - L'équivalence pour l'UI
 */
export const typeOfReservation = (typeOfReservation: string): string => {
  switch (typeOfReservation) {
    case "ByCompany":
      return "Entreprise";
    case "ByWeb":
      return "site web";
    case "ByPhone":
      return "Téléphone";
    default:
      return "Inconnu";
  }
};

/**
 * Compte le nombre total de clients en attente
 * @param sessions - Liste des sessions avec détails
 * @returns Nombre de clients en attente
 */
export function countAllWaitingCustomers(
  sessions: ISessionWithDetails[]
): number {
  return sessions.reduce((count: number, session: ISessionWithDetails) => {
    return (
      count +
      session.customerSessions.reduce(
        (subCount: number, customerSession: ICustomerSession) => {
          return customerSession.status === "Waiting" ? subCount + 1 : subCount;
        },
        0
      )
    );
  }, 0);
}
