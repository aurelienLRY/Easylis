import { IEmailScenario, ITemplateData } from "./types";
import { generateEmailTemplate } from "./base.template";

export const generateEmail = (
  scenario: IEmailScenario,
  data: ITemplateData
): string => {
  const templateData = scenario.template(data);
  return generateEmailTemplate(templateData);
};

export { emailScenarios } from "./scenarios";
