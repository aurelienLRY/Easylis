"use server";
/* Models */
import {
  Activity,
  CustomerSession,
  Spot,
  Session,
} from "@/libs/database/models";

/*Types*/
import {
  IActivity,
  ISpot,
  ICustomerSession,
  ISession,
  ISessionWithDetails,
} from "@/types";

export const GET_SERVER_SESSION_WITH_DETAILS = async (
  sessionId: string
): Promise<ISessionWithDetails> => {
  const session = (await Session.findById(sessionId)) as ISession;
  const activity = (await Activity.findById(session.activity)) as IActivity;
  const spot = (await Spot.findById(session.spot)) as ISpot;
  const customerSession = (await CustomerSession.find({
    sessionId: session._id,
  })) as ICustomerSession[];

  const sessionWithDetails = {
    ...(session as any).toObject(),
    activity: activity && activity,
    spot: spot && spot,
    customerSessions: customerSession && customerSession,
  } as ISessionWithDetails;
  return sessionWithDetails;
};

export const GET_SERVER_SESSIONS_WITH_DETAILS = async (): Promise<
  ISessionWithDetails[]
> => {
  const sessions = (await Session.find()) as ISession[];
  const sessionsWithDetails = await Promise.all(
    sessions.map((session) => GET_SERVER_SESSION_WITH_DETAILS(session._id))
  );
  return sessionsWithDetails;
};
