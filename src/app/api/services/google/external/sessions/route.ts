import { NextRequest, NextResponse } from "next/server";

import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { Session } from "@/libs/database";


export async function GET(req: NextRequest) {
  try {

    await connectDB();
    const sessions = await Session.find({
        expires: { $gt: new Date() },
    });
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  finally {
    await disconnectDB();
  }
}