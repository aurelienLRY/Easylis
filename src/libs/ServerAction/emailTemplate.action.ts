"use server";

/* Gestion Database */
import { connectDB, disconnectDB, EmailTemplate } from "@/libs/database";

/* Types */
import {
  IEmailTemplate,
  ICallbackForEmailTemplate,
  ICallbackForEmailTemplates,
} from "@/types";

/*
 * Create an email template
 * @param emailTemplate - The email template to create
 * @returns The callback for the email template
 */
export const CREATE_EMAIL_TEMPLATE = async (
  emailTemplate: IEmailTemplate
): Promise<ICallbackForEmailTemplate> => {
  try {
    await connectDB();
    const newEmailTemplate = new EmailTemplate(emailTemplate);
    (await newEmailTemplate.save()) as IEmailTemplate;
    if (!newEmailTemplate || newEmailTemplate === null) {
      throw new Error("Template email non créé");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newEmailTemplate as IEmailTemplate)),
      feedback: ["EmailTemplate created successfully"],
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    return {
      success: false,
      data: null,
      feedback: null,
      error: errorMessage,
    };
  } finally {
    await disconnectDB();
  }
};

/**
 * Get all email templates
 * @returns The callback for the email template
 */
export const GET_EMAIL_TEMPLATE =
  async (): Promise<ICallbackForEmailTemplates> => {
    try {
      await connectDB();
      const emailTemplate = (await EmailTemplate.find()) as IEmailTemplate[];
      if (!emailTemplate || emailTemplate === null) {
        throw new Error("Template email non trouvé");
      }
      return {
        success: true,
        data: JSON.parse(JSON.stringify(emailTemplate)),
        feedback: ["EmailTemplate found successfully"],
        error: null,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      return {
        success: false,
        data: null,
        feedback: null,
        error: errorMessage,
      };
    } finally {
      await disconnectDB();
    }
  };

/*
 * Get an email template by scenario
 * @param scenario - The scenario to get the email template
 * @returns The callback for the email template
 */
export const GET_EMAIL_TEMPLATE_BY_SCENARIO = async (
  scenario: string
): Promise<ICallbackForEmailTemplate> => {
  try {
    await connectDB();
    const emailTemplate = (await EmailTemplate.findOne({
      scenario,
    })) as IEmailTemplate;
    if (!emailTemplate || emailTemplate === null) {
      throw new Error("Template email non trouvé");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(emailTemplate)),
      feedback: null,
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    return {
      success: false,
      data: null,
      feedback: null,
      error: errorMessage,
    };
  } finally {
    await disconnectDB();
  }
};

/*
 * Update an email template
 * @param emailTemplate - The email template to update
 * @returns The callback for the email template
 */
export const UPDATE_EMAIL_TEMPLATE = async (
  emailTemplate: IEmailTemplate
): Promise<ICallbackForEmailTemplate> => {
  try {
    await connectDB();
    const email = (await EmailTemplate.findByIdAndUpdate(
      emailTemplate._id,
      emailTemplate,
      { new: true }
    )) as IEmailTemplate;
    if (!email || email === null) {
      throw new Error("Template email non trouvé");
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(email)),
      feedback: ["Template email mis à jour avec succès"],
      error: null,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    return {
      success: false,
      data: null,
      feedback: null,
      error: errorMessage,
    };
  } finally {
    await disconnectDB();
  }
};
