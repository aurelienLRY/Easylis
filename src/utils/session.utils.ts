import { ICustomerSession, ISessionWithDetails } from "@/types";

/**
 * Function qui calcule le nombre de sessions pour le mois en cours ou l'année en cours
 * @param sessions : ISessionWithDetails[] , type : string (month ou year)
 * @returns : number
 */
export const calculateNumberOfSessions = (
  sessions: ISessionWithDetails[],
  type: "month" | "year"
) => {
  const now = new Date();

  if (type === "month") {
    const month = now.getMonth();
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate.getMonth() === month;
    }).length;
  }

  const year = now.getFullYear();
  return sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate.getFullYear() === year;
  }).length;
};

/*
 * Function qui calcule le nombre de personnes inscrites pour le mois en cours ou l'année en cours
 * @param sessions : ISessionWithDetails[] , type : string (month ou year)
 * @returns : number
 */
export const calculateInscrit = (
  sessions: ISessionWithDetails[],
  type: "month" | "year"
) => {
  const now = new Date();
  let total = 0;
  if (type === "month") {
    const month = now.getMonth();
    sessions.map((session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate.getMonth() === month) {
        session.customerSessions.forEach(
          (customerSession: ICustomerSession) => {
            if (customerSession.status === "Validated") {
              total += customerSession.number_of_people;
            }
          }
        );
      }
    });
    return total;
  }

  const year = now.getFullYear();
  sessions.map((session) => {
    const sessionDate = new Date(session.date);
    if (sessionDate.getFullYear() === year) {
      session.customerSessions.forEach((customerSession: ICustomerSession) => {
        if (customerSession.status === "Validated") {
          total += customerSession.number_of_people;
        }
      });
    }
  });
  return total;
};

/**
 * Function qui filtre les sessions  pour retourner maximum les 4 prochaines sessions , Actif à partir de la date du jour
 * @param sessions : ISessionWithDetails[]
 * @returns : ISessionWithDetails[]
 */
export const filterSessionsForDashboard = (sessions: ISessionWithDetails[]) => {
  return sessions
    .filter((session) => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      return sessionDate >= now && session.status === "Actif";
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);
};

/**
 * Function qui classe les lieux par nombre de sessions et retourne un tableau d'objet avec le nom du lieu et le nombre de sessions
 * @param sessions : ISessionWithDetails[]
 * @returns : { [key: string]: number }
 */
export const classifySpots = (sessions: ISessionWithDetails[]) => {
  let lieux: { [key: string]: number } = {};
  sessions.map((session) => {
    if (lieux[session.spot.name]) {
      lieux[session.spot.name]++;
    } else {
      lieux[session.spot.name] = 1;
    }
  });
  return lieux;
};

/**
 * Function qui classe les activitées par nombre de sessions et retourne un tableau d'objet avec le nom de l'activité et le nombre de sessions
 * @param sessions : ISessionWithDetails[]
 * @returns : { [key: string]: number }
 */
export const classifyActivities = (sessions: ISessionWithDetails[]) => {
  let activities: { [key: string]: number } = {};
  sessions.map((session) => {
    if (activities[session.activity.name]) {
      activities[session.activity.name]++;
    } else {
      activities[session.activity.name] = 1;
    }
  });
  return activities;
};

/**
 * Function qui retourne le nombre de session par statut
 * @param sessions : ISessionWithDetails[]
 * @param status : string
 * @returns : number
 */
export const getSessionByStatus = (
  sessions: ISessionWithDetails[],
  status: "Pending" | "Validated" | "Archived"
) => {
  return sessions.filter((session) => session.status === status).length;
};
