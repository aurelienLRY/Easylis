/* Cache Duration for all stores */
export const isCacheDuration = 240000; // 4 minutes en millisecondes

/* EXPORT STORES */
export { useSessions } from "@/store/sessions.store"; // Sessions Store
//export { useCustomerSessions } from "@/store/customerSessions.store"; // Customer Sessions Store
export { useSessionWithDetails } from "@/store/sessionWithDetails.store"; // Session With Details Store
export { useSpots } from "@/store/spots.store"; // Spots Store
export { useActivities } from "@/store/activities.store"; // Activities Store
export { useProfile } from "@/store/profile.store"; // Profile Store
export { useCalendar } from "@/store/calendar.store"; // Calendar Store
