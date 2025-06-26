import { NextRequest , NextResponse} from "next/server";
import { connectDB, disconnectDB } from "@/libs/database/setting.mongoose";
import { Spot } from "@/libs/database";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const spots = await Spot.find();
    return NextResponse.json(spots, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await disconnectDB();
  }
}