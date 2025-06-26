import { NextRequest , NextResponse} from "next/server";
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { Spot } from "@/libs/database";

const TSpot = {
    "_id": "Types.ObjectId",
    "name": "string",
    "description": "string",
    "practicedActivities": [
        {
            "activityName": "string",
            "activityId": "Types.ObjectId",
            "_id": "Types.ObjectId"
        }
    ],
    "photo": "string",
    "gpsCoordinates": "string",
    "estimatedDuration": "string",
    "meetingPoint": {
        "half_day": "string | null",
        "full_day": "string | null"
    },
    "__v": "number"
}
    

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const spots = await Spot.find();
    return NextResponse.json({
        Type : TSpot,
        spots: spots
    }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await disconnectDB();
  }
}