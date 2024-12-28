import mongoose, { Schema, model } from "mongoose";
import { ISpot } from "@/types";

const SpotSchema = new Schema<ISpot>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  practicedActivities: [
    {
      activityName: {
        type: String,
        required: false,
      },
      activityId: {
        type: Schema.Types.ObjectId,
        required: false,
      },
    },
  ],
  photo: {
    type: String,
    required: false,
  },
  gpsCoordinates: {
    type: String,
    required: true,
  },
  meetingPoint: {
    half_day: {
      type: String,
      required: false,
    },
    full_day: {
      type: String,
      required: false,
    },
  },
});

export const Spot =
  mongoose.models.Spot || mongoose.model<ISpot>("Spot", SpotSchema);
