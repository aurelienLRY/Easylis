import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth";
import { connectDBOnce, CustomerSession, Session } from "@/libs/database";
import {
  GET_SERVER_SESSION_WITH_DETAILS,
  GET_USER_BY_ID,
} from "@/libs/ServerAction";
import {
  EMAIL_SCENARIOS,
  emailScenarios,
  generateEmail,
} from "@/services/Mailer/clientSide";
import { nodeMailerSender } from "@/services/Mailer/serverSide";
import { ICustomerSession, ISession, ISessionWithDetails, IUser } from "@/types";
import { createPhotoShareToken } from "@/libs/utils/photoShareToken.utils";

const MERCHANT_PHOTO_BASE_URL = process.env.MERCHANT_PHOTO_BASE_URL;

const normalizeSlug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function POST(request: NextRequest) {
  try {
    if (!MERCHANT_PHOTO_BASE_URL) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          feedback: null,
          error: "MERCHANT_PHOTO_BASE_URL manquante",
        },
        { status: 500 }
      );
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const sessionId = body.sessionId as string | undefined;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "sessionId requis" },
        { status: 400 }
      );
    }

    await connectDBOnce();

    const dbSession = (await Session.findById(sessionId)) as ISession | null;
    if (!dbSession) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Session introuvable" },
        { status: 404 }
      );
    }

    const sessionWithDetails =
      (await GET_SERVER_SESSION_WITH_DETAILS(sessionId)) as ISessionWithDetails;

    const sessionSlug = `${normalizeSlug(
      sessionWithDetails.activity?.name || "session"
    )}-${sessionId}`;

    const adminUserId = String(
      (session.user as { _id?: string; id?: string })._id ||
        (session.user as { id?: string }).id ||
        ""
    );
    const adminUserRes = adminUserId
      ? await GET_USER_BY_ID(adminUserId)
      : { success: false as const, data: null };

    const rawAdmin = adminUserRes.success && adminUserRes.data
      ? (adminUserRes.data as IUser)
      : null;
    const profile_from: IUser = rawAdmin
      ? {
          ...rawAdmin,
          password: undefined,
          firstName: rawAdmin.firstName || "Occitanie Évasion",
          phone: rawAdmin.phone || "",
        }
      : {
          email: "contact@occitanie-evasion.com",
          username: "occitanie-evasion",
          firstName: "Occitanie Évasion",
          phone: "",
          tokenCalendar: null,
          tokenRefreshCalendar: null,
        };

    const customers = (await CustomerSession.find({
      sessionId,
      status: { $ne: "Canceled" },
    })) as ICustomerSession[];

    if (!customers.length) {
      return NextResponse.json({
        success: true,
        data: { sent: 0, failed: 0, total: 0, failedRecipients: [] },
        feedback: ["Aucun client à notifier"],
        error: null,
      });
    }

    let sent = 0;
    const failedRecipients: string[] = [];

    const photoScenario = emailScenarios[EMAIL_SCENARIOS.SESSION_PHOTOS_SHARE];
    const sessionForTemplate = sessionWithDetails as Omit<
      ISessionWithDetails,
      "_id"
    >;

    for (const customer of customers) {
      const token = createPhotoShareToken(sessionId, customer._id);
      const shareUrl = `${MERCHANT_PHOTO_BASE_URL.replace(
        /\/$/,
        ""
      )}/${sessionSlug}?token=${encodeURIComponent(token)}`;

      const { _id: _customerId, ...customerForTemplate } = customer;

      const html = generateEmail(photoScenario, {
        customer: customerForTemplate,
        session: sessionForTemplate,
        profile_from,
        photoShareUrl: shareUrl,
      });

      const subject = photoScenario.subject;

      const result = await nodeMailerSender(
        customer.email,
        subject,
        html,
        {},
        "SESSION_PHOTOS_SHARE",
        customer._id,
        sessionId
      );

      if (result.success) {
        sent += 1;
      } else {
        failedRecipients.push(customer.email);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sent,
        failed: customers.length - sent,
        total: customers.length,
        failedRecipients,
      },
      feedback: [`${sent}/${customers.length} email(s) envoyé(s)`],
      error: null,
    });
  } catch (error) {
    console.error("[session-photos][share] Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
