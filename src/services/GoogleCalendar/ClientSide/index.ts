"use client";
/* Client Side */
export { fetcherRefreshToken } from "@/services/GoogleCalendar/ClientSide/fetcherRefreshToken"; // Rafraîchie le token
export { fetcherCheckToken } from "@/services/GoogleCalendar/ClientSide/fetcherCheckToken"; // Vérifie le token
export { fetcherAddEvent } from "@/services/GoogleCalendar/ClientSide/fetcherAddEvent"; // Ajoute un événement
export { fetcherUpdateEvent } from "@/services/GoogleCalendar/ClientSide/fetcherUpdateEvent"; // Met à jour un événement
export { fetcherDeleteEvent } from "@/services/GoogleCalendar/ClientSide/fetcherDeleteEvent"; // Supprime un événement
export { fetcherCheckEventExists } from "@/services/GoogleCalendar/ClientSide/fetcherCheckEventExists"; // Vérifie si un événement existe
export { generateEvent } from "@/services/GoogleCalendar/ClientSide/generateEvent"; // Génère un événement
export { syncCalendar } from "@/services/GoogleCalendar/ClientSide/syncCalendar"; // Synchronise le calendrier (nouvelle version côté client)
// export { fetcherSyncCalendar } from "@/services/GoogleCalendar/ClientSide/fetcherSyncCalendar"; // Synchronise le calendrier (ancienne version serveur)
