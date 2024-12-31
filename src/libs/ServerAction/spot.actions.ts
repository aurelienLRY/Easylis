"use server";

/* libs */
import * as yup from "yup";
import xss from "xss";

/* Gestion Database */
import { connectDB, disconnectDB, Spot } from "@/libs/database";

/* YUP schema */
import { spotSchema } from "@/libs/yup";

/* Types */
import { ISpot, ICallbackForSpot, ICallbackForSpots } from "@/types";

/* Actions */
import { GET_SERVER_SESSIONS_WITH_DETAILS } from "@/libs/ServerAction";

/*
 * Validate the spot
 * @param spot - The spot to validate
 * @returns The validation result
 */
export const validateSpot = async (spot: ISpot) => {
  return await spotSchema.validate(spot, {
    abortEarly: false,
  });
};

/*
 * XSS the spot
 * @param spot - The spot to xss
 * @returns The xss result
 */
export const xssSpot = async (spot: ISpot): Promise<ISpot> => {
  try {
    const xssData: ISpot = {
      ...spot,
      name: xss(spot.name),
      description: xss(spot.description),
      gpsCoordinates: xss(spot.gpsCoordinates),
      practicedActivities: spot.practicedActivities.map((activity) => ({
        ...activity,
        activityId: xss(activity.activityId),
        activityName: xss(activity.activityName),
      })),
      photo: xss(spot.photo),
      meetingPoint: {
        half_day: spot.meetingPoint.half_day
          ? xss(spot.meetingPoint.half_day)
          : spot.gpsCoordinates
          ? spot.gpsCoordinates
          : null,
        full_day: spot.meetingPoint.full_day
          ? xss(spot.meetingPoint.full_day)
          : spot.gpsCoordinates
          ? spot.gpsCoordinates
          : null,
      },
    };
    return JSON.parse(JSON.stringify(xssData));
  } catch (error) {
    console.error("Erreur lors de la validation du lieu:", error);
    throw error;
  }
};

/*
 * Create a spot
 * @param spot - The spot to create
 * @returns The callback for the spot
 */
export async function CREATE_SPOT(spot: ISpot): Promise<ICallbackForSpot> {
  try {
    /* validation & cleaning */
    const YupValidation = await validateSpot(spot);
    const cleanSpot = await xssSpot(YupValidation as ISpot);

    if (!cleanSpot.meetingPoint.half_day && !cleanSpot.meetingPoint.full_day) {
      throw new Error("Au moins un point de rendez-vous est requis");
    }

    await connectDB();
    const newSpot = new Spot(cleanSpot);
    await newSpot.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newSpot)),
      error: null,
      feedback: ["Spot créé avec succès"],
    };
  } catch (error) {
    console.error("Erreur lors de la création du spot:", error);
    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        error: null,
        feedback: error.errors,
        data: null,
      };
    } else {
      const message = (error as Error).message;
      return {
        success: false,
        error: message,
        feedback: null,
        data: null,
      };
    }
  } finally {
    await disconnectDB();
  }
}

/*
 * Get all spots
 * @returns The callback for the spots
 */
export async function GET_SPOTS(): Promise<ICallbackForSpots> {
  try {
    await connectDB();
    const spots = await Spot.find();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(spots)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error("Erreur lors de la récupération des spots:", error);
    return {
      success: false,
      data: null,
      error: message,
      feedback: null,
    };
  } finally {
    await disconnectDB();
  }
}

/*
 * Get a spot by id
 * @param id - The id of the spot to get
 * @returns The callback for the spot
 */
export async function GET_SPOT_BY_ID(id: string): Promise<ICallbackForSpot> {
  try {
    await connectDB();
    const spot = await Spot.findById(id);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(spot)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du spot:", error);
    const message = (error as Error).message;
    return {
      success: false,
      data: null,
      error: message,
      feedback: null,
    };
  }
}

/*
 * Update a spot
 * @param id - The id of the spot to update
 * @param spot - The spot to update
 * @returns The callback for the spot
 */
export async function UPDATE_SPOT(
  id: string,
  spot: ISpot
): Promise<ICallbackForSpot> {
  try {
    /* validation & cleaning */
    const YupValidation = await validateSpot(spot);
    const cleanSpot = await xssSpot(YupValidation as ISpot);

    if (!cleanSpot.meetingPoint.half_day && !cleanSpot.meetingPoint.full_day) {
      throw new Error("Au moins un point de rendez-vous est requis");
    }

    await connectDB();

    const updatedSpot = await Spot.findByIdAndUpdate(id, cleanSpot, {
      new: true,
    });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedSpot)),
      error: null,
      feedback: ["lieu modifié avec succès"],
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du spot:", error);
    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        error: null,
        feedback: error.errors,
        data: null,
      };
    } else {
      const message = (error as Error).message;
      return {
        success: false,
        data: null,
        error: message,
        feedback: null,
      };
    }
  } finally {
    await disconnectDB();
  }
}

/*
 * Delete a spot
 * @param id - The id of the spot to delete
 * @returns The callback for the spot
 */
export const DELETE_SPOT = async (
  spotId: string
): Promise<ICallbackForSpot> => {
  try {
    await connectDB();
    const sessionsWithDetails = await GET_SERVER_SESSIONS_WITH_DETAILS();
    const sessionsWithDetailsBySpot = sessionsWithDetails.filter(
      (session) => session.spot._id === spotId
    );
    if (sessionsWithDetailsBySpot.length > 0) {
      return {
        success: false,
        error: "Ce spot est utilisé dans une session",
        data: null,
        feedback: null,
      };
    }
    const result = await Spot.findByIdAndDelete(spotId);
    if (!result) {
      throw new Error("lieu non trouvé");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(result)),
      error: null,
      feedback: ["Spot supprimé avec succès"],
    };
  } catch (error) {
    const message = (error as Error).message;
    console.log(message);
    return { success: false, error: message, data: null, feedback: null };
  } finally {
    await disconnectDB();
  }
};
