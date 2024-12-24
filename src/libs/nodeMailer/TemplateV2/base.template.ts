import { IEmailTemplateData } from "./types";

/**
 * Génération du template de l'email
 */
export const generateEmailTemplate = (
  templateData: IEmailTemplateData
): string => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${templateData.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Inter, Inter FallBack; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #075985; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${templateData.title}</h1>
          </div>

          <div style="padding: 20px; color: #333; font-size: 16px; line-height: 1.6;">
            ${templateData.content}
            
            ${
              templateData.buttonText && templateData.buttonUrl
                ? `
              <div style="text-align: center; margin-top: 20px;">
                <a href="${templateData.buttonUrl}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #f97316; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; ">
                  ${templateData.buttonText}
                </a>
              </div>
            `
                : ""
            }
          </div>

          <div style="background-color: #075985; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Cordialement,<br>${
              templateData.profile_from.firstName
            }</p>
            <div style="margin-bottom: 10px;">
              <a href="mailto:contact@occitanie-evasion.com" style="color: white; text-decoration: none;">
                contact@occitanie-evasion.com
              </a>
              <br>
              <a href="tel:${
                templateData.profile_from.phone
              }" style="color: white; text-decoration: none;">
                ${templateData.profile_from.phone}
              </a>
            </div>
            <p style="margin: 0; opacity: 0.8;">
              © ${new Date().getFullYear()} Occitanie évasion | Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
