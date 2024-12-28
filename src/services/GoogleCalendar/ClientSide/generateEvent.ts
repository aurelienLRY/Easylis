import { ICalendarEvent, ISessionWithDetails } from "@/types";
import { formatDateTime } from "@/utils";

export const generateEvent = (session: ISessionWithDetails): ICalendarEvent => {
  const timeZone = "Europe/Paris";
  const location =
    session.spot.gpsCoordinates || session.spot.name || "Non renseigné";
  const summary =
    `${session.activity.name} - ${session.spot.name}` || "Réservation activité";

  const eventStartDateTime = new Date(
    formatDateTime(session.date, session.startTime)
  );
  const reminderDateTime = new Date(eventStartDateTime);
  reminderDateTime.setDate(reminderDateTime.getDate() - 1); // Un jour avant
  reminderDateTime.setHours(18, 0, 0, 0); // 18h00

  const minutesUntilReminder = Math.floor(
    (eventStartDateTime.getTime() - reminderDateTime.getTime()) / (1000 * 60)
  );

  return {
    colorId: "2",
    eventType: "default",
    summary: summary,
    description: ThisDescription(session),
    start: {
      dateTime: formatDateTime(session.date, session.startTime),
      timeZone: timeZone,
    },
    end: {
      dateTime: formatDateTime(session.date, session.endTime),
      timeZone: timeZone,
    },
    location: location,
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: minutesUntilReminder },
        { method: "popup", minutes: 180 },
      ],
    },
  };
};

const ThisDescription = (session: ISessionWithDetails) => {
  let group: string[] = [];
  if (session.customerSessions) {
    const filteredCustomerSessions = session.customerSessions.filter(
      (customerSession) => customerSession.status !== "Canceled"
    );
    group = filteredCustomerSessions?.map((customerSession, index) => {
      return `<p>${index + 1} - ${customerSession.last_name} ${
        customerSession.first_names
      } - 📞 ${customerSession.phone} - Nombre de personnes : ${
        customerSession.number_of_people
      } - soit ${customerSession.price_total}€ </p>`;
    });
  }

  return `
    <div>
      <p>Activité : ${session.activity.name}</p>
      <p>Spot : ${session.spot.name}</p>
      <p>Date : ${new Date(session.date).toLocaleDateString("fr-FR")}</p>
      <p>Heure de début : ${session.startTime}</p>
      <p>Heure de fin : ${session.endTime}</p>
      <p>Nombre de participants : ${session.placesReserved}</p>
      <p>Groupes : ${group || "Non renseigné"}</p>
    </div>`;
};
