export { cn } from "@/utils/cn";
export { crypto } from "@/utils/crypto.utils";
export { getNestedValue } from "@/utils/customLoadash.utils";
export {
  customerIsCancelled,
  customerIsWaiting,
  customerWaitingCount,
  getCustomerStatusDisplay,
  typeOfReservation,
  countAllWaitingCustomers,
} from "@/utils/customer.utils";
export {
  formatDate,
  getMonthString,
  getMonthValue,
  getYearString,
} from "@/utils/date.utils";
export {
  calculateSessionIncome,
  calculateSessionIncomeByMonth,
  calculateSessionsIncome,
} from "@/utils/price.utils";
export { SearchInObject } from "@/utils/search.utils";
export {
  calculateInscrit,
  calculateNumberOfSessions,
  classifyActivities,
  classifySpots,
  filterSessionsForDashboard,
  getSessionByStatus,
} from "@/utils/session.utils";
export { capitalizeFirstLetter } from "@/utils/typo.utils";
export { uploadAvatarAction } from "@/utils/uploadAvatar.utils";
