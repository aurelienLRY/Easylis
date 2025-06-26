import { NextRequest, NextResponse } from "next/server";

import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { Activity } from "@/libs/database";

const TActivity = {
    "_id": "Types.ObjectId",
    "name": "string",
    "description": "string",
    "price_half_day": {
        "standard": "number",
        "reduced": "number",
        "ACM": "number"
    },
    "price_full_day": {
        "standard": "number",
        "reduced": "number",
        "ACM": "number"
    },
    "duration": {
        "half": "string | null",
        "full": "string | null"
    },
    "half_day": "boolean",
    "full_day": "boolean",
    "min_age": "number",
    "max_OfPeople": "number",
    "min_OfPeople": "number",
    "required_equipment": "string",
    "__v": "number"
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const activities = await Activity.find({});
    return NextResponse.json({
        Type : TActivity,
        activities: activities
    }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await disconnectDB();
  }
}   