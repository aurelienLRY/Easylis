"use server";

import { connectDBOnce } from "@/libs/database/setting.mongoose";
import { EmailLog, IEmailLog } from "@/libs/database/models/EmailLog.model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth";

/**
 * Crée un nouveau log d'email
 */
export const CREATE_EMAIL_LOG = async (
  emailData: {
    recipient: string;
    subject: string;
    content: string;
    scenario: string;
    customerId?: string;
    sessionId?: string;
  },
  result: {
    success: boolean;
    messageId?: string;
    error?: any;
  }
): Promise<IEmailLog> => {
  try {
    await connectDBOnce();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    const emailLog = new EmailLog({
      recipient: emailData.recipient,
      subject: emailData.subject,
      content: emailData.content,
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error?.message || result.error,
      sentAt: new Date(),
      userId: session.user.id,
      scenario: emailData.scenario,
      retryCount: 0,
      customerId: emailData.customerId,
      sessionId: emailData.sessionId,
    });

    await emailLog.save();
    return emailLog;
  } catch (error) {
    console.error("Erreur lors de la création du log d'email:", error);
    throw error;
  }
};

/**
 * Récupère les logs d'emails pour un utilisateur
 */
export const GET_EMAIL_LOGS = async (
  filters: {
    status?: 'sent' | 'failed' | 'pending';
    scenario?: string;
    recipient?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  } = {}
): Promise<{
  logs: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    await connectDBOnce();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    const { status, scenario, recipient, startDate, endDate, limit = 20, page = 1 } = filters;
    
    // Construction de la requête
    const query: any = { userId: session.user.id };
    
    if (status) query.status = status;
    if (scenario) query.scenario = scenario;
    if (recipient) query.recipient = { $regex: recipient, $options: 'i' };
    if (startDate || endDate) {
      query.sentAt = {};
      if (startDate) query.sentAt.$gte = startDate;
      if (endDate) query.sentAt.$lte = endDate;
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;
    
    // Récupération des logs
    const logs = await EmailLog.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Comptage total
    const total = await EmailLog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des logs d'emails:", error);
    throw error;
  }
};

/**
 * Met à jour le statut d'un log d'email
 */
export const UPDATE_EMAIL_LOG_STATUS = async (
  logId: string,
  status: 'sent' | 'failed' | 'pending',
  messageId?: string,
  error?: string
): Promise<IEmailLog> => {
  try {
    await connectDBOnce();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    const updateData: any = { status };
    if (messageId) updateData.messageId = messageId;
    if (error) updateData.error = error;

    const emailLog = await EmailLog.findOneAndUpdate(
      { _id: logId, userId: session.user.id },
      updateData,
      { new: true }
    );

    if (!emailLog) {
      throw new Error("Log d'email non trouvé");
    }

    return emailLog;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du log d'email:", error);
    throw error;
  }
};

/**
 * Récupère les statistiques des emails
 */
export const GET_EMAIL_STATS = async (): Promise<{
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number;
  recentActivity: Array<{ date: string; count: number }>;
}> => {
  try {
    await connectDBOnce();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Utilisateur non authentifié");
    }

    // Statistiques globales
    const [totalSent, totalFailed, totalPending] = await Promise.all([
      EmailLog.countDocuments({ userId: session.user.id, status: 'sent' }),
      EmailLog.countDocuments({ userId: session.user.id, status: 'failed' }),
      EmailLog.countDocuments({ userId: session.user.id, status: 'pending' }),
    ]);

    const total = totalSent + totalFailed + totalPending;
    const successRate = total > 0 ? (totalSent / total) * 100 : 0;

    // Activité récente (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await EmailLog.aggregate([
      {
        $match: {
          userId: session.user.id,
          sentAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return {
      totalSent,
      totalFailed,
      totalPending,
      successRate: Math.round(successRate * 100) / 100,
      recentActivity: recentActivity.map(item => ({
        date: item._id,
        count: item.count
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    throw error;
  }
}; 