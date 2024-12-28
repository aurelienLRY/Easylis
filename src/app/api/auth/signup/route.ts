import { connectDB } from "@/libs/database/setting.mongoose";
import { User } from "@/libs/database/models/User.model";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, username } = await req.json();
  await connectDB();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, username });
  await user.save();
  return NextResponse.json({ message: "User created" }, { status: 201 });
}
