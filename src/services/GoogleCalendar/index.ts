/* Server Side */
export {
  GoogleAuthorization,
  addEvent,
  checkToken,
  deleteEvent,
  getEvent,
  oauth2Client,
  refreshAccessToken,
  updateEvent,
  
} from "@/services/GoogleCalendar/ServerSide";
/* Client Side */
export {
  fetcherAddEvent,
  fetcherCheckToken,
  fetcherDeleteEvent,
  fetcherRefreshToken,
  fetcherUpdateEvent,
  fetcherSyncCalendar,
  generateEvent,
} from "@/services/GoogleCalendar/ClientSide";
