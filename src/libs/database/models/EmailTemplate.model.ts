import mongoose, { Schema } from "mongoose";
/* Types */
import { IEmailTemplate } from "@/types";

const EmailTemplateSchema: Schema<IEmailTemplate> = new Schema({
  scenario: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
});

export const EmailTemplate =
  mongoose.models?.EmailTemplate ||
  mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
