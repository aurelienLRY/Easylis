import mongoose, { Schema } from "mongoose";
import { ISession } from "@/types";

const sessionSchema = new Schema<ISession>({
  status: { type: String, required: true, default: "Pending" },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  activity: { type: String, required: true },
  spot: { type: String, required: true },
  placesMax: { type: Number, required: true },
  placesReserved: { type: Number, required: true, default: 0 },
  type_formule: { type: String, required: true },
  duration: { type: String, required: true },
});

export const Session =
  mongoose.models?.Session ||
  mongoose.model<ISession>("Session", sessionSchema);
