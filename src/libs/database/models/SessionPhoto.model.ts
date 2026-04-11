import mongoose, { Schema } from "mongoose";
import { ISessionPhoto } from "@/types";

const sessionPhotoSchema = new Schema<ISessionPhoto>({
  sessionId: { type: String, required: true, index: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true, index: true },
  deletedAt: { type: Date, default: null, index: true },
});

export const SessionPhoto =
  mongoose.models?.SessionPhoto ||
  mongoose.model<ISessionPhoto>("SessionPhoto", sessionPhotoSchema);
