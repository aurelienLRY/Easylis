import { create } from "zustand";
import { toast } from "sonner";
import { emailScenarios } from "@/libs/nodeMailer/TemplateV2/scenarios";
import { EmailScenarioType } from "@/libs/nodeMailer/TemplateV2/constants";
import { generateEmail } from "@/libs/nodeMailer/TemplateV2";
import { nodeMailerSender } from "@/libs/nodeMailer";
import { ITemplateData } from "@/libs/nodeMailer/TemplateV2/types";

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

  openEditor: () => void;
  closeEditor: () => void;
  handleEmailContent: (content: string) => void;
  prepareEmail: (scenario: EmailScenarioType, data: ITemplateData) => void;
  sendEmail: () => Promise<boolean>;
  setQueuedEmails: (emails: QueuedEmail[]) => void;
  processNextEmail: () => boolean;
  onClose: () => void;
};

export const useMailer = create<MailerStore>((set, get) => ({
  isSubmitting: false,
  isEditorOpen: false,
  initialEmailContent: "",
  currentEmailContent: "",
  queuedEmails: [],
  emailData: null,
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
    });
  },

  sendEmail: async () => {
    const { currentEmailContent, emailData } = get();
    if (!emailData) return false;

    try {
      set({ isSubmitting: true });
      const success = await nodeMailerSender(
        emailData.to,
        emailData.subject,
        currentEmailContent
      );
      set({ isSubmitting: false });
      if (!success) {
        throw new Error("Échec de l'envoi de l'email");
      } else {
        toast.success("Email envoyé avec succès");
        get().onClose();
        get().closeEditor();
        return true;
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
      get().onClose();
      get().closeEditor();
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
}));
