"use server";

/* Libs */
import * as yup from "yup";
import xss from "xss";

/* Gestion Database */
import { connectDB, disconnectDB, User } from "@/libs/database";
/* Types */
import { IUser, ICallbackForUser } from "@/types";
/* Yup */
import { userSchema } from "@/libs/yup";
/* Next Auth */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";

/**
 * Validate the user
 * @param user - The user to validate
 * @returns The validation result
 */
export const validateUser = async (user: IUser) => {
  return await userSchema.validate(user, {
    abortEarly: false,
  });
};

export const xssUser = async (user: IUser): Promise<IUser | object> => {
  try {
    const xssData: IUser = {
      ...user,
      lastName: user.lastName && xss(user.lastName),
      firstName: user.firstName && xss(user.firstName),
      phone: user.phone && xss(user.phone),
      avatar: user.avatar && xss(user.avatar),
      email: xss(user.email),
      username: xss(user.username),
    };
    return JSON.parse(JSON.stringify(xssData));
  } catch (error) {
    console.error("Erreur lors de la validation du user:", error);
    throw error;
  }
};

/**
 * Update the user
 * @param user - The user to update
 * @returns The update result
 */
export const UPDATE_USER = async (
  id: string,
  user: IUser
): Promise<ICallbackForUser> => {
  try {
    /* validation & cleaning */
    const YupValidation = await validateUser(user);
    const cleanUser = await xssUser(YupValidation as IUser);

    await connectDB();
    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      id,
      cleanUser,
      {
        new: true,
      }
    );

    if (updatedUser) {
      const { password, ...userWithoutPassword } = (
        updatedUser as any
      ).toObject();

      return {
        success: true,
        data: JSON.parse(JSON.stringify(userWithoutPassword)),
        error: null,
        feedback: ["Votre profil a été modifié avec succès"],
      };
    } else {
      return {
        success: false,
        data: null,
        error: "Utilisateur non trouvé",
        feedback: null,
      };
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du user:", error);
    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        data: null,
        error: null,
        feedback: error.errors,
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
};

export async function GET_USER_BY_ID(id: string): Promise<ICallbackForUser> {
  try {
    await connectDB();
    const user = await User.findById(id);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error("Erreur lors de la récupération du user:", error);
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

export async function GET_USER_SESSION(): Promise<ICallbackForUser> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error("Session non trouvée");
    }
    const response = await GET_USER_BY_ID(session?.user.id as string);
    const { password, ...userWithoutPassword } = response.data as IUser;

    return {
      success: true,
      data: JSON.parse(JSON.stringify(userWithoutPassword)),
      error: null,
      feedback: null,
    };
  } catch (error) {
    const message = (error as Error).message;
    console.error("Erreur lors de la récupération du user:", error);
    return {
      success: false,
      data: null,
      error: message,
      feedback: null,
    };
  }
}
