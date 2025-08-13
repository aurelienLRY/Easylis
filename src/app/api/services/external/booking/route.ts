import { NextRequest, NextResponse } from "next/server";

// Utils
import { checkIfActivityExists, checkIfSpotExists, xssBooking } from "./utils";
// Database
import { connectDBOnce } from "@/libs/database/setting.mongoose";
import { Session, CustomerSession, User } from "@/libs/database";
// Types
import { IActivity, ISession, ISpot, ICustomerSession } from "@/types";
import { IBooking, IReservationSession } from "./type";

// NodeMailer
import { emailScenarios, generateEmail } from "@/services/Mailer/clientSide";
import { GET_SERVER_SESSION_WITH_DETAILS } from "@/libs/ServerAction";
import { nodeMailerSenderAPI } from "@/services/Mailer/serverSide";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer: RCustomer, session: RSession } = body;
    if (!RCustomer || !RSession) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDBOnce();
    // Vérification de l'activité et du spot 
    const activityExists : IActivity = await checkIfActivityExists(RSession.activity);
    const spotExists : ISpot = await checkIfSpotExists(RSession.spot);
    
    if (!spotExists || !activityExists) {
      return NextResponse.json({ error: "Spot or activity not found" }, { status: 404 });
    }

   const BookingVerified = await xssBooking(body);

   // Préparation de la session à créer
   const PreSession : Omit<ISession, "_id"> = {
    status: "Pending",
    date: BookingVerified.session.date ,
    startTime: BookingVerified.session.startTime,
    endTime: BookingVerified.session.endTime,
    activity: BookingVerified.session.activity,
    spot: BookingVerified.session.spot,
    type_formule: BookingVerified.session.type_formule as "half_day" | "full_day",
    placesMax: BookingVerified.session.placesMax,
    placesReserved: 0,
    duration: BookingVerified.session.duration as string  || undefined,
   }
 
   // Création de la session
   const newSession :ISession = await Session.create(PreSession);

   // Préparation du client à créer
  const preCustomer : Omit<ICustomerSession, "_id"> = {
  createdAt: new Date(),
  validatedAt: null,
  canceledAt: null,
  sessionId: newSession._id as string,
  date: BookingVerified.customer.date,
  status: "Waiting",
  typeOfReservation: BookingVerified.customer.typeOfReservation,
  number_of_people: BookingVerified.customer.number_of_people,
  last_name: BookingVerified.customer.last_name,
  first_names: BookingVerified.customer.first_names,
  email: BookingVerified.customer.email,
  phone: BookingVerified.customer.phone,
  people_list: BookingVerified.customer.people_list,
  tarification: BookingVerified.customer.tarification,
  price_applicable: BookingVerified.customer.price_applicable,
  price_total: BookingVerified.customer.price_total,
}

   // Création du client
  const newCustomer = await CustomerSession.create(preCustomer);
   // Mise à jour de la session
   await Session.findByIdAndUpdate(newSession._id, { $inc: { placesReserved: BookingVerified.customer.number_of_people } }, { new: true });

   const sessionWithDetails = await GET_SERVER_SESSION_WITH_DETAILS(newSession._id as string);

   // Récupération du deuxième utilisateur pour les emails serveur
   const users = await User.find();
   const serverUser = users[1]; // Récupère le second utilisateur (index 1)
   
   if (!serverUser) {
     console.error("❌ Aucun utilisateur serveur trouvé pour l'envoi d'email");
   }

   // Envoi de l'email de confirmation avec gestion d'erreur
   try {
     const PreEmail = generateEmail(emailScenarios.BOOKING_REQUEST, {
       customer: preCustomer,
       session: sessionWithDetails, 
       profile_from: serverUser 
     });
     
     const emailSent = await nodeMailerSenderAPI(
       preCustomer.email, 
       emailScenarios.BOOKING_REQUEST.subject, 
       PreEmail,
       {},
       "BOOKING_REQUEST",
       newCustomer._id as string,
       newSession._id as string,
       serverUser?._id as string // Passage de l'ID du deuxième utilisateur
     );

     if (!emailSent) {
       console.error("❌ Échec d'envoi de l'email de confirmation pour la réservation:", {
         customerId: newCustomer._id,
         sessionId: newSession._id,
         email: preCustomer.email
       });
       // Ne pas faire échouer la réservation si l'email échoue
     } else {
       console.log("✅ Email de confirmation envoyé avec succès:", {
         customerId: newCustomer._id,
         sessionId: newSession._id,
         email: preCustomer.email,
         scenario: "BOOKING_REQUEST"
       });
     }
   } catch (emailError) {
     console.error("❌ Erreur lors de l'envoi de l'email de confirmation:", {
       error: emailError,
       customerId: newCustomer._id,
       sessionId: newSession._id,
       email: preCustomer.email
     });
     // Ne pas faire échouer la réservation si l'email échoue
   }

   return NextResponse.json({ 
     message: "Booking request received",
     sessionId: newSession._id,
     customerId: newCustomer._id
   }, { status: 200 });
  } catch (error) {
    console.error("❌ Erreur lors du traitement de la réservation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Ajouter un client à une Session existante
 * @param req 
 * @returns 
 */
 export async function PATCH(req: NextRequest) {
  try {
    console.log("🔄 Ajout d'un client à une session existante");
    const body = await req.json();
    console.log("🔄 Body:", body);
    const { customer, sessionId } = body;
    if (!customer || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDBOnce();

    // Vérification que la session existe
    const existingSession : ISession | null = await Session.findById(sessionId);
    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Vérification que la session n'est pas annulée ou terminée
    if (existingSession.status === "Archived") {
      return NextResponse.json({ error: "Session is not available for booking" }, { status: 400 });
    }


     const data :IBooking = {
      customer: customer,
      session: existingSession as IReservationSession
     }

    // Validation et nettoyage des données du client
    const BookingVerified = await xssBooking(data);

    // Préparation du client à créer
    const preCustomer: Omit<ICustomerSession, "_id"> = {
      createdAt: new Date(),
      validatedAt: null,
      canceledAt: null,
      sessionId: sessionId,
      date: BookingVerified.customer.date,
      status: "Waiting",
      typeOfReservation: BookingVerified.customer.typeOfReservation,
      number_of_people: BookingVerified.customer.number_of_people,
      last_name: BookingVerified.customer.last_name,
      first_names: BookingVerified.customer.first_names,
      email: BookingVerified.customer.email,
      phone: BookingVerified.customer.phone,
      people_list: BookingVerified.customer.people_list,
      tarification: BookingVerified.customer.tarification,
      price_applicable: BookingVerified.customer.price_applicable,
      price_total: BookingVerified.customer.price_total,
    };

    // Création du client
    const newCustomer = await CustomerSession.create(preCustomer);

    // Mise à jour du nombre de places réservées dans la session
    await Session.findByIdAndUpdate(
      sessionId, 
      { $inc: { placesReserved: BookingVerified.customer.number_of_people } }, 
      { new: true }
    );

    // Récupération de la session mise à jour avec tous les détails
    const sessionWithDetails = await GET_SERVER_SESSION_WITH_DETAILS(sessionId);

    // Récupération du deuxième utilisateur pour les emails serveur
    const users = await User.find();
    const serverUser = users[1]; // Récupère le second utilisateur (index 1)
    
    if (!serverUser) {
      console.error("❌ Aucun utilisateur serveur trouvé pour l'envoi d'email");
    }

    // Envoi de l'email de confirmation avec gestion d'erreur
    try {
      const PreEmail = generateEmail(emailScenarios.BOOKING_REQUEST, {
        customer: preCustomer,
        session: sessionWithDetails, 
        profile_from: serverUser 
      });
      
      const emailSent = await nodeMailerSenderAPI(
        preCustomer.email, 
        emailScenarios.BOOKING_REQUEST.subject, 
        PreEmail,
        {},
        "BOOKING_REQUEST",
        newCustomer._id as string,
        sessionId,
        serverUser?._id as string
      );

      if (!emailSent) {
        console.error("❌ Échec d'envoi de l'email de confirmation pour l'ajout de client:", {
          customerId: newCustomer._id,
          sessionId: sessionId,
          email: preCustomer.email
        });
        // Ne pas faire échouer l'ajout si l'email échoue
      } else {
        console.log("✅ Email de confirmation envoyé avec succès pour l'ajout de client:", {
          customerId: newCustomer._id,
          sessionId: sessionId,
          email: preCustomer.email,
          scenario: "BOOKING_REQUEST"
        });
      }
    } catch (emailError) {
      console.error("❌ Erreur lors de l'envoi de l'email de confirmation pour l'ajout de client:", {
        error: emailError,
        customerId: newCustomer._id,
        sessionId: sessionId,
        email: preCustomer.email
      });
      // Ne pas faire échouer l'ajout si l'email échoue
    }

    return NextResponse.json({ 
      message: "Customer added to session successfully",
      sessionId: sessionId,
      customerId: newCustomer._id,
      availablePlaces: existingSession.placesMax - existingSession.placesReserved
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du client à la session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}