import {
  ISessionWithDetails,
  ISession,
  IActivity,
  ISpot,
  ICustomerSession,
  IEmailTemplate,
  IUser,
  IEventModel,
  ICredentials,
} from "@/types";

/**
 * Interface for a callback
 * @property {boolean} success - The success of the callback
 * @property {string | null} error - The error of the callback
 * @property {object | null} data - The data of the callback
 * @property {string[] | string | null} feedback - The feedback of the callback
 */
export interface ICallback {
  success: boolean;
  error: string | null;
  data: object | null;
  feedback: string[] | null;
}

/**
 * Interface for a callback for a session with details
 * @extends ICallback
 * @property {ISessionWithDetails} data - The session with details
 */
export interface ICallbackForSessionWithDetails extends ICallback {
  data: ISessionWithDetails | null;
}

/*
 * Interface for a callback for a session with details array
 * @extends ICallback
 * @property {ISessionWithDetails[]} data - The session with details array
 */
export interface ICallbackForSessionWithDetailsArray extends ICallback {
  data: ISessionWithDetails[] | null;
}

/*
 * Interface for a callback for a session
 * @extends ICallback
 * @property {ISession} data - The session
 */
export interface ICallbackForSessions extends ICallback {
  data: ISession[] | null;
}

/*
 * Interface for a callback for a session
 * @extends ICallback
 * @property {ISession} data - The session
 */
export interface ICallbackForSession extends ICallback {
  data: ISession | null;
}

/*
 * Interface for a callback for an activity
 * @extends ICallback
 * @property {IActivity} data - The activity
 */
export interface ICallbackForActivity extends ICallback {
  data: IActivity | null;
}

/*
 * Interface for a callback for activities
 * @extends ICallback
 * @property {IActivity[]} data - The activities
 */
export interface ICallbackForActivities extends ICallback {
  data: IActivity[] | null;
}

/*
 * Interface for a callback for a spot
 * @extends ICallback
 * @property {ISpot} data - The spot
 */
export interface ICallbackForSpot extends ICallback {
  data: ISpot | null;
}

/*
 * Interface for a callback for spots
 * @extends ICallback
 * @property {ISpot[]} data - The spots
 */
export interface ICallbackForSpots extends ICallback {
  data: ISpot[] | null;
}

/*
 * Interface for a callback for a customerSession
 * @extends ICallback
 * @property {ICustomerSession} data - The customerSession
 */
export interface ICallbackForCustomerSession extends ICallback {
  data: ICustomerSession | null;
}

/*
 * Interface for a callback for customerSessions
 * @extends ICallback
 * @property {ICustomerSession[]} data - The customerSessions
 */
export interface ICallbackForCustomerSessions extends ICallback {
  data: ICustomerSession[] | null;
}

/*
 * Interface for a callback for an emailTemplate
 * @extends ICallback
 * @property {IEmailTemplate} data - The emailTemplate
 */
export interface ICallbackForEmailTemplate extends ICallback {
  data: IEmailTemplate | null;
}

/*
 * Interface for a callback for emailTemplates
 * @extends ICallback
 * @property {IEmailTemplate[]} data - The emailTemplates
 */
export interface ICallbackForEmailTemplates extends ICallback {
  data: IEmailTemplate[] | null;
}

/** Interface for a callback for a user
 * @extends ICallback
 * @property {IUser} data - The user
 */
export interface ICallbackForUser extends ICallback {
  data: IUser | null;
}

/** @extends ICallback
 * @property {IEventModel} data - The event
 */
export interface ICallbackForEvent extends ICallback {
  data: IEventModel | null;
}

export interface ICallbackForCredentials extends ICallback {
  data: ICredentials | null;
}
