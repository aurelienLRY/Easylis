import {  ISessionWithDetails , ICustomerSession} from "@/types";



/*
    Filter valid customer session prices
    @param customerSessions - The customer sessions to filter
    @returns An array of valid prices
*/
const getValidPrices = (customerSessions: ICustomerSession[]): number[] => {
  return customerSessions
    .filter(cs => cs.price_total > 0 && cs.status !== "Canceled")
    .map(cs => cs.price_total);
}

/*
    Calculate the revenue of a session
    @param session - The session to calculate the revenue for
    @returns The revenue of the session
*/
export const calculateSessionIncome = (session: ISessionWithDetails): number => {
  const validPrices = getValidPrices(session.customerSessions);
  return validPrices.reduce((acc, curr) => acc + curr, 0);
}


/*
    Calculate the revenue of multiple sessions
    @param sessions - The sessions to calculate the revenue for
    @returns The revenue of the sessions
*/
export const calculateSessionsIncome = (sessions: ISessionWithDetails[]): number => {
  return sessions.reduce((acc, curr) => acc + calculateSessionIncome(curr), 0);
}

/*
    Calculate the revenue of a session by month or year
    @param sessions - The sessions to calculate the revenue for
    @param type - The type of the revenue to calculate (month or year)
    @returns The revenue of the sessions
*/
export const calculateSessionIncomeByMonth = (sessions: ISessionWithDetails[] , type: "month" | "year"): number => {
  const now = new Date();
  let total = 0;
  if(type === "month") {
    const month = now.getMonth();
    sessions.map((session) => {
      const sessionDate = new Date(session.date);   
    if (sessionDate.getMonth() === month ){
       total += calculateSessionIncome(session);
    }
    });
    return total;
  }
  else if (type === "year") {
    const year = now.getFullYear();
    sessions.map((session) => {
    const sessionDate = new Date(session.date);
    if (sessionDate.getFullYear() === year) {
      total += calculateSessionIncome(session);
    }
  });
  return total;
}
else {
  return 0;
}
}