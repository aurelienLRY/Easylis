import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";
import { uploadAvatarAction } from "@/utils";
import { ICallback } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ICallback>> {
  // Vérifier la session utilisateur
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: "Non autorisé",
      },
      { status: 401 }
    );
  }

  const userId = session.user._id as string;

  const formData = await request.formData();
  console.log("formData server", formData);

  // Appeler la fonction pour traiter l'upload de l'avatar
  const result = await uploadAvatarAction(formData, userId);
  console.log("result", result);

  if (result.success && result.data) {
    return NextResponse.json(
      {
        success: true,
        data: { path: result.data?.avatar as string },
        feedback: result.feedback,
        error: null,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: result.error,
      },
      { status: 400 }
    );
  }
}
