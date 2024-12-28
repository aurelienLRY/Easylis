import mongoose, { Schema, model } from "mongoose";

/* Types */
import { IUser } from "@/types";

/* Utils */
import { capitalizeFirstLetter, crypto } from "@/utils";

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, default: "first-name ?" },
    lastName: { type: String, required: true, default: "last-name ?" },
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email invalide"],
    },
    phone: { type: String },
    avatar: { type: String, default: "/img/default-avatar.webp" },
    password: { type: String, required: true },
    username: { type: String, required: true, default: "username ?" },
    calendar: { type: Boolean, default: false },
    tokenCalendar: { type: String, default: null },
    tokenRefreshCalendar: { type: String, default: null },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.firstName) {
    this.firstName = capitalizeFirstLetter(this.firstName);
    this.firstName = await crypto.encrypt(this.firstName);
  }
  if (this.lastName) {
    this.lastName = capitalizeFirstLetter(this.lastName);
    this.lastName = await crypto.encrypt(this.lastName);
  }
  if (this.phone) {
    this.phone = await crypto.encrypt(this.phone);
  }

  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update: any = this.getUpdate();
  if (update.firstName) {
    update.firstName = await crypto.encrypt(update.firstName);
  }
  if (update.lastName) {
    update.lastName = await crypto.encrypt(update.lastName);
  }
  if (update.phone) {
    update.phone = await crypto.encrypt(update.phone);
  }

  next();
});

UserSchema.post("findOneAndUpdate", async function (doc) {
  if (doc.firstName !== null) {
    doc.firstName = await crypto.decrypt(doc.firstName);
  }
  if (doc.lastName !== null) {
    doc.lastName = await crypto.decrypt(doc.lastName);
  }
  if (doc.phone !== null) {
    doc.phone = await crypto.decrypt(doc.phone);
  }
  if (doc?.password) {
    delete doc.password;
  }
});

UserSchema.post("findOne", async function (doc) {
  if (doc.firstName !== null) {
    doc.firstName = await crypto.decrypt(doc.firstName);
  }
  if (doc.lastName !== null) {
    doc.lastName = await crypto.decrypt(doc.lastName);
  }
  if (doc.phone !== null) {
    doc.phone = await crypto.decrypt(doc.phone);
  }
});

export const User = mongoose.models?.User || model<IUser>("User", UserSchema);
