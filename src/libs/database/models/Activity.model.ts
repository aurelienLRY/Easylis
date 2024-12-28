import mongoose, { Schema, model } from "mongoose";
/* Types */
import { IActivity } from "@/types";

const activitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },

  half_day: {
    type: Boolean,
    required: true,
  },
  full_day: {
    type: Boolean,
    required: true,
  },

  price_half_day: {
    standard: {
      type: Number,
      validate: {
        validator: function (this: any, value: number) {
          return !this.half_day || (this.half_day && value != null);
        },
        message:
          "Le prix standard pour la demi-journée est requis si 'half_day' est sélectionné.",
      },
    },
    reduced: {
      type: Number,
      required: false,
    },
    ACM: {
      type: Number,
      required: false,
    },
  },

  price_full_day: {
    standard: {
      type: Number,
      validate: {
        validator: function (this: any, value: number) {
          return !this.full_day || (this.full_day && value != null);
        },
        message:
          "Le prix standard pour la journée complète est requis si 'full_day' est sélectionné.",
      },
    },
    reduced: {
      type: Number,
      required: false,
    },
    ACM: {
      type: Number,
      required: false,
    },
  },

  min_age: {
    type: Number,
    required: true,
  },
  max_OfPeople: {
    type: Number,
    required: true,
  },
  min_OfPeople: {
    type: Number,
    required: true,
  },
  duration: {
    half: {
      type: String,
      required: false,
    },
    full: {
      type: String,
      required: false,
    },
  },
  required_equipment: {
    type: String,
    required: false,
    default: null,
  },
});

export const Activity =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", activitySchema);
