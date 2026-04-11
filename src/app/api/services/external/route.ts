import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({
        info : "This is the external services API for the booking system  ",
        activities : "/api/services/external/activities",
        spots : "/api/services/external/spots",
        sessions : "/api/services/external/sessions",
        booking : "/api/services/external/booking",
        sessionPhotos : "GET /api/services/external/session-photos?sessionId=&token= (Bearer NEXT_API_OUT_SERVICES)",
        }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}