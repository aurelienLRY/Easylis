import { create } from "zustand";
import { generateEmail ,
  EmailScenarioType ,
   ITemplateData , 
   IEmailSendResult ,
    EmailErrorType ,
     EmailClientService , 
     emailScenarios
    } from "@/services/Mailer/clientSide";

import { showEmailToast } from "@/components/feedback/EmailToast.feedback";


interface QueuedEmail {
  scenario: EmailScenarioType;
  data: ITemplateData;
}

export type MailerStore = {
  isSubmitting: boolean;
  isEditorOpen: boolean;
  initialEmailContent: string;
  currentEmailContent: string;
  queuedEmails: QueuedEmail[];
  emailData: {
    to: string;
    subject: string;
  } | null;
  lastSendResult: IEmailSendResult | null;

  openEditor: () => void;
  closeEditor: () => void;
  handleEmailContent: (content: string) => void;
  prepareEmail: (scenario: EmailScenarioType, data: ITemplateData) => void;
  sendEmail: () => Promise<boolean>;
  setQueuedEmails: (emails: QueuedEmail[]) => void;
  processNextEmail: () => boolean;
  onClose: () => void;
  getLastSendResult: () => IEmailSendResult | null;
  clearLastSendResult: () => void;
};



export const useMailer = create<MailerStore>((set, get) => ({
  isSubmitting: false,
  isEditorOpen: false,
  initialEmailContent: "",
  currentEmailContent: "",
  queuedEmails: [],
  emailData: null,
  lastSendResult: null,
  onClose: () => {},

  setOption: (option: any) => {
    option;
  },

  openEditor: () => set({ isEditorOpen: true }),

  closeEditor: () =>
    set({
      isEditorOpen: false,
      initialEmailContent: "",
      currentEmailContent: "",
      emailData: null,
      lastSendResult: null,
    }),

  handleEmailContent: (content) => set({ currentEmailContent: content }),

  prepareEmail: (scenario, data) => {
    const emailScenario = emailScenarios[scenario];
    const fullEmailContent = generateEmail(emailScenario, data);

    set({
      isEditorOpen: true,
      initialEmailContent: fullEmailContent,
      currentEmailContent: fullEmailContent,
      emailData: {
        to: data.customer.email,
        subject: emailScenario.subject,
      },
      lastSendResult: null,
    });
  },

  sendEmail: async () => {
    const { currentEmailContent, emailData } = get();
    if (!emailData) return false;

    try {
      set({ isSubmitting: true });
      
      const result: IEmailSendResult = await EmailClientService.sendEmail(
        emailData.to,
        emailData.subject,
        currentEmailContent
      );

      // Stocker le résultat
      set({ 
        isSubmitting: false,
        lastSendResult: result
      });

      // Afficher le toast approprié
      showEmailToast(result, () => get().sendEmail());

      if (result.success) {
        // Log détaillé en mode développement
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Email envoyé avec succès:", {
            recipient: result.recipient,
            subject: result.subject,
            messageId: result.messageId,
            timestamp: result.timestamp,
            retryCount: result.retryCount
          });
        }
        
        get().onClose();
        get().closeEditor();
        return true;
      } else {
        // Log détaillé de l'erreur
        console.error("❌ Échec d'envoi email:", {
          recipient: result.recipient,
          subject: result.subject,
          error: result.error,
          timestamp: result.timestamp,
          retryCount: result.retryCount
        });

        // Ne pas fermer l'éditeur en cas d'erreur pour permettre la correction
        return false;
      }
    } catch (error: any) {
      console.error("Erreur inattendue lors de l'envoi de l'email:", error);
      
      const errorResult: IEmailSendResult = {
        success: false,
        recipient: emailData.to,
        subject: emailData.subject,
        timestamp: new Date(),
        error: {
          type: EmailErrorType.UNKNOWN_ERROR,
          message: "Erreur inattendue lors de l'envoi",
          details: error.message,
          retryable: true
        }
      };

      set({ 
        isSubmitting: false,
        lastSendResult: errorResult
      });

      // Afficher le toast d'erreur inattendue
      showEmailToast(errorResult, () => get().sendEmail());

      return false;
    }
  },

  setQueuedEmails: (emails) => set({ queuedEmails: emails }),

  processNextEmail: () => {
    const { queuedEmails } = get();
    if (queuedEmails.length > 0) {
      const [nextEmail, ...remainingEmails] = queuedEmails;
      get().prepareEmail(nextEmail.scenario, nextEmail.data);
      set({ queuedEmails: remainingEmails });
      console.log("useMailer.ts: queuedEmails", queuedEmails);
      return true;
    }
    return false;
  },

  getLastSendResult: () => {
    return get().lastSendResult;
  },

  clearLastSendResult: () => {
    set({ lastSendResult: null });
  },
}));
