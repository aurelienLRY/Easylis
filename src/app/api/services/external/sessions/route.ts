import { NextRequest, NextResponse } from "next/server";

import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { Session , Activity , Spot } from "@/libs/database";


 const Tsession = {
 
        "_id": "Types.ObjectId",
        "status": "string",
        "date": "Date",
        "startTime": "string",
        "endTime": "string",
        "activity": {
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
                "half": " string | null",
                "full": " string | null"
            },
            "_id": " Types.ObjectId",
            "name": " string",
            "description": " string",
            "half_day": " boolean",
            "full_day": " boolean",
            "min_age": " number",
            "max_OfPeople": " number",
            "min_OfPeople": " number",
            "required_equipment": " string",
            "__v": " number"
        },
        "spot": {
            "meetingPoint": {
                "half_day": " string | null",
                "full_day": " string | null"
            },
            "_id": " Types.ObjectId",
            "name": " string",
            "description": " string",
            "practicedActivities": [
                {
                    "activityName": " string",
                    "activityId": " Types.ObjectId",
                    "_id": " Types.ObjectId"
                }
            ],
            "photo": " string",
            "gpsCoordinates": " string",
            "__v": " number"
        },
        "placesMax": " number",
        "placesReserved": " number",
        "type_formule": " string",
        "duration": " string",
        "__v": " number"
    }



export async function GET(req: NextRequest) {
  try {

    await connectDB();
    const sessions = await Session.find({
      date: { $gte: new Date() },
      status: "Actif"
    });
    const activities = await Activity.find({});
    const spots = await Spot.find({});

    const sessionsWithActivitiesAndSpots = sessions.map((session) => {
      const activity = activities.find((activity) => activity._id.toString() === session.activity.toString());
      const spot = spots.find((spot) => spot._id.toString() === session.spot.toString());
      return {
        ...session.toObject(),
        activity: activity?.toObject(),
        spot: spot?.toObject()
      }
    });

    return NextResponse.json({ 
      Type : Tsession,
      ActiveSessions: sessionsWithActivitiesAndSpots 
    }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  finally {
    await disconnectDB();
  }
}