import { EmailScenarioType } from "./constants";
import { ICustomerSession, ISessionWithDetails, IUser } from "@/types";

export interface IEmailTemplateData {
  title: string;
  content: string;
  buttonText?: string;
  buttonUrl?: string;
  profile_from: IUser;
}

export interface ITemplateData {
  customer: ICustomerSession;
  session: ISessionWithDetails;
  profile_from: IUser;
  changes?: {
    oldDate?: Date;
    oldStartTime?: string;
    oldSpot?: string;
  };
}

export interface IEmailScenario {
  scenario: EmailScenarioType;
  subject: string;
  template: (data: ITemplateData) => IEmailTemplateData;
}
