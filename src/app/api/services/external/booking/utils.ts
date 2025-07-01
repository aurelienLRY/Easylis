import { Activity, Spot } from "@/libs/database";
import  xss  from "xss";
import { IBooking, IParticipant } from "./type";







export const checkIfActivityExists = async (activityId: string) => {
    try {
        const activityExists = await Activity.findById(activityId);
        return activityExists;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'activité:", error);
        throw error;
    }
}

export const checkIfSpotExists = async (spotId: string) => {
    try {
        const spotExists = await Spot.findById(spotId);
        return spotExists;
    } catch (error) {
        console.error("Erreur lors de la vérification du spot:", error);
        throw error;
    }
}

export const xssBooking = async (booking: IBooking) => {
    try {
        const xssBooking = {
            ...booking,
            customer: {
                ...booking.customer,
                first_names: xss(booking.customer.first_names),
                last_name: xss(booking.customer.last_name),
                email: xss(booking.customer.email),
                phone: xss(booking.customer.phone),
                status: xss(booking.customer.status),
                typeOfReservation: xss(booking.customer.typeOfReservation),
                people_list: booking.customer.people_list.map((person: IParticipant) => ({
                    ...person,
                    size: xss(person.size),
                    weight: xss(person.weight),
                })),
            },
            session: {
                ...booking.session,
                status: xss(booking.session.status),
                startTime: xss(booking.session.startTime),
                endTime: xss(booking.session.endTime),
                activity: xss(booking.session.activity),
                spot: xss(booking.session.spot),
                type_formule: xss(booking.session.type_formule),
                duration: booking.session.duration ? xss(booking.session.duration) : null,
                
            }
        }
        return xssBooking;
    } catch (error) {
        console.error("Erreur lors du xss de la réservation:", error);
        throw error;
    }
}