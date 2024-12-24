import mongoose, { Schema } from "mongoose";
/* Types */
import { IEventModel } from "@/types";

const EventCalendarSchema = new Schema<IEventModel>({
  eventId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
});

export const EventCalendar =
  mongoose.models?.EventCalendar ||
  mongoose.model<IEventModel>("EventCalendar", EventCalendarSchema);
