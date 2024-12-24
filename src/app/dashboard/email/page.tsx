/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import { getMockData } from "@/utils";
import { useMailer } from "@/hooks/useMailer";
import { useProfile } from "@/store";
/*components*/
import { EmailTemplateEditor } from "@/components";
import { EMAIL_SCENARIOS } from "@/libs/nodeMailer/TemplateV2/constants";

export default function EmailPage() {
  const { mock_Customer, mock_SessionWithDetails } = getMockData();
  const mailer = useMailer();
  const { profile } = useProfile();

  React.useEffect(() => {
    mailer.prepareEmail(EMAIL_SCENARIOS.ADD_CUSTOMER, {
      customer: mock_Customer,
      session: mock_SessionWithDetails,
      profile_from: profile!,
    });
  }, []);

  const handleSendEmail = () => {
    console.log(mailer.currentEmailContent);
  };

  return (
    <section className="flex flex-col gap-4 justify-center items-center w-full">
      <EmailTemplateEditor
        isOpen={true}
        onClose={() => {
          console.log("close");
        }}
        onSend={handleSendEmail}
        Mail={mailer.initialEmailContent}
        EmailContent={mailer.handleEmailContent}
      />
    </section>
  );
}
