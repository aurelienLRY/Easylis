import { NextRequest , NextResponse} from "next/server";
import { GET_SPOTS } from "@/libs/ServerAction/spot.actions";



export async function GET(req: NextRequest) {
  try {
    const spots = await GET_SPOTS();
    return NextResponse.json(spots, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}