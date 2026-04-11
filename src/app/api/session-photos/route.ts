import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth";
import { connectDBOnce, Session, Activity, SessionPhoto } from "@/libs/database";
import { ISession } from "@/types";

const EXTERNAL_API_URL = process.env.PHOTO_STORAGE_API_URL;

const normalizeSlug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDateForFileName = (dateValue: Date | string): string => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ensureExternalConfig = () => {
  if (!EXTERNAL_API_URL) {
    throw new Error("PHOTO_STORAGE_API_URL manquante");
  }
};

const cleanupExpiredPhotos = async () => {
  const now = new Date();
  const expiredPhotos = await SessionPhoto.find({
    deletedAt: null,
    expiresAt: { $lte: now },
  });

  if (!expiredPhotos.length) {
    return;
  }

  await Promise.all(
    expiredPhotos.map(async (photo) => {
      try {
        await fetch(`${EXTERNAL_API_URL}/photos`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: photo.sessionId,
            fileName: photo.fileName,
          }),
        });
      } catch (error) {
        console.error("Erreur suppression photo distante:", error);
      }

      await SessionPhoto.findByIdAndUpdate(photo._id, { deletedAt: new Date() });
    })
  );
};

export async function GET(request: NextRequest) {
  try {
    ensureExternalConfig();
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "sessionId requis" },
        { status: 400 }
      );
    }

    await connectDBOnce();
    await cleanupExpiredPhotos();

    const photos = await SessionPhoto.find({
      sessionId,
      deletedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ uploadedAt: -1 });

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(photos)),
      feedback: null,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureExternalConfig();
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string | null;
    const files = formData.getAll("files") as File[];

    if (!sessionId) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "sessionId requis" },
        { status: 400 }
      );
    }
    if (!files.length) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Aucune photo" },
        { status: 400 }
      );
    }

    await connectDBOnce();
    await cleanupExpiredPhotos();

    const currentSession = (await Session.findById(sessionId)) as ISession | null;
    if (!currentSession) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Session introuvable" },
        { status: 404 }
      );
    }

    const activity = await Activity.findById(currentSession.activity);
    const companySlug = normalizeSlug("occitanie-evasion");
    const activitySlug = normalizeSlug(activity?.name || "activite");
    const dateSlug = formatDateForFileName(currentSession.date);

    const existingCount = await SessionPhoto.countDocuments({
      sessionId,
      deletedAt: null,
      expiresAt: { $gt: new Date() },
    });

    const uploadedPhotos = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        throw new Error(`Type de fichier invalide: ${file.type || "inconnu"}`);
      }
      const extension = file.name.includes(".")
        ? `.${file.name.split(".").pop()!.toLowerCase()}`
        : ".jpg";
      const fileNumber = existingCount + i + 1;
      const fileName = `${companySlug}-${activitySlug}-${dateSlug}-${fileNumber}${extension}`;

      const externalFormData = new FormData();
      externalFormData.append("sessionId", sessionId);
      externalFormData.append("fileName", fileName);
      externalFormData.append("file", file);

      const uploadResponse = await fetch(`${EXTERNAL_API_URL}/photos/upload`, {
        method: "POST",
        body: externalFormData,
      });
      const rawUploadResponse = await uploadResponse.text();
      let uploadData: any = null;
      try {
        uploadData = rawUploadResponse ? JSON.parse(rawUploadResponse) : null;
      } catch (_error) {
        uploadData = null;
      }

      if (!uploadResponse.ok || !uploadData?.success) {
        throw new Error(
          uploadData?.error ||
            `Erreur upload serveur photo (${uploadResponse.status}) - ${rawUploadResponse?.slice(
              0,
              200
            )}`
        );
      }

      const uploadedAt = new Date();
      const expiresAt = new Date(uploadedAt);
      expiresAt.setMonth(expiresAt.getMonth() + 3);

      const newPhoto = await SessionPhoto.create({
        sessionId,
        originalName: file.name,
        fileName,
        fileUrl: uploadData.data.fileUrl as string,
        mimeType: file.type || "image/jpeg",
        size: file.size,
        uploadedAt,
        expiresAt,
        deletedAt: null,
      });

      uploadedPhotos.push(newPhoto);
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(uploadedPhotos)),
      feedback: ["Photos ajoutées avec succès"],
      error: null,
    });
  } catch (error) {
    console.error("[session-photos][POST] Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    ensureExternalConfig();
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const photoId = body.photoId as string | undefined;
    if (!photoId) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "photoId requis" },
        { status: 400 }
      );
    }

    await connectDBOnce();
    const photo = await SessionPhoto.findById(photoId);
    if (!photo || photo.deletedAt) {
      return NextResponse.json(
        { success: false, data: null, feedback: null, error: "Photo introuvable" },
        { status: 404 }
      );
    }

    const deleteResponse = await fetch(`${EXTERNAL_API_URL}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: photo.sessionId,
        fileName: photo.fileName,
      }),
    });
    const rawDeleteResponse = await deleteResponse.text();
    let deleteData: any = null;
    try {
      deleteData = rawDeleteResponse ? JSON.parse(rawDeleteResponse) : null;
    } catch (_error) {
      deleteData = null;
    }

    if (!deleteResponse.ok || !deleteData?.success) {
      throw new Error(
        deleteData?.error ||
          `Erreur suppression serveur photo (${deleteResponse.status}) - ${rawDeleteResponse?.slice(
            0,
            200
          )}`
      );
    }

    photo.deletedAt = new Date();
    await photo.save();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(photo)),
      feedback: ["Photo supprimée avec succès"],
      error: null,
    });
  } catch (error) {
    console.error("[session-photos][DELETE] Erreur:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        feedback: null,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
