"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/layout/Modal.layout";
import { ISessionWithDetails, ISessionPhoto } from "@/types";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FileUpload } from "@/components/input/upload-file";
import { MdAlternateEmail } from "react-icons/md";
import { SecondaryButton } from "@/components/buttons/Buttons";

type Props = {
  data: ISessionWithDetails;
  isOpen: boolean;
  onClose: () => void;
};

type Mode = "upload" | "manage";
const MAX_PHOTO_SIZE_MB = 3;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;

const readImageDimensions = (
  file: File
): Promise<{ width: number; height: number; image: HTMLImageElement }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.width, height: image.height, image });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Impossible de lire l'image: ${file.name}`));
    };
    image.src = url;
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Impossible de compresser l'image"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });

const compressImageToMaxSize = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/")) {
    throw new Error(`Fichier invalide: ${file.name}`);
  }
  if (file.size <= MAX_PHOTO_SIZE_BYTES) {
    return file;
  }

  const { width, height, image } = await readImageDimensions(file);
  const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height, 1);
  const targetWidth = Math.max(1, Math.round(width * ratio));
  const targetHeight = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas indisponible pour la compression");
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  let quality = 0.9;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > MAX_PHOTO_SIZE_BYTES && quality > 0.35) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(
      `La photo ${file.name} reste trop lourde après compression (>${MAX_PHOTO_SIZE_MB}MB).`
    );
  }

  const safeBaseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${safeBaseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};

export const SessionPhotosModal = ({ data, isOpen, onClose }: Props) => {
  const [photos, setPhotos] = useState<ISessionPhoto[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [mode, setMode] = useState<Mode>("upload");

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/session-photos?sessionId=${data._id}`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur récupération des photos");
      }
      setPhotos(result.data || []);
      setMode((result.data || []).length ? "manage" : "upload");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [data._id]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      return;
    }
    fetchPhotos();
  }, [isOpen, fetchPhotos]);

  const uploadPhotos = async () => {
    if (!selectedFiles.length) {
      toast.error("Sélectionnez au moins une photo.");
      return;
    }

    setIsLoading(true);
    try {
      const preparedFiles: File[] = [];
      for (const file of selectedFiles) {
        const prepared = await compressImageToMaxSize(file);
        preparedFiles.push(prepared);
      }

      for (const file of preparedFiles) {
        const formData = new FormData();
        formData.append("sessionId", data._id);
        formData.append("files", file);

        const response = await fetch("/api/session-photos", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Erreur upload");
        }
      }

      toast.success("Photos ajoutées avec succès");
      setSelectedFiles([]);
      await fetchPhotos();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/session-photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur suppression");
      }
      toast.success("Photo supprimée");
      await fetchPhotos();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhotoLinks = async () => {
    setIsSharing(true);
    try {
      const response = await fetch("/api/session-photos/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data._id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur envoi emails");
      }
      toast.success(
        `Liens photos envoyés: ${result.data.sent}/${result.data.total}`
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSharing(false);
    }
  };

  const expirationText = useMemo(
    () =>
      "Les photos sont supprimées automatiquement 3 mois après leur téléversement.",
    []
  );

  const canSharePhotoLinks = useMemo(() => {
    const clientCount =
      data.customerSessions?.filter((c) => c.status !== "Canceled").length ??
      0;
    return clientCount > 0 && photos.length > 0;
  }, [data.customerSessions, photos.length]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Photos de session - ${data.activity.name}`}
    >
      <div className="w-full flex flex-col gap-4 text-white">
    

        <div className="flex justify-center items-center gap-3">
          <button
            className={`min-w-28 px-4 py-2 rounded-md font-medium transition-all ${
              mode === "upload"
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/40"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
            onClick={() => setMode("upload")}
          >
            Ajouter
          </button>
          <button
            className={`min-w-28 px-4 py-2 rounded-md font-medium transition-all ${
              mode === "manage"
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/40"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
            onClick={() => setMode("manage")}
          >
            Gérer ({photos.length})
          </button>
        </div>
        {canSharePhotoLinks && (
          <div className="flex justify-center">
            <SecondaryButton
              onClick={sendPhotoLinks}
              disabled={isSharing || isLoading}
              className="flex items-center justify-center gap-2 min-w-28 px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {isSharing ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                  Envoi des liens...
                </>
              ) : (
                <>
                  <MdAlternateEmail className="text-lg" />
                  Envoyer le lien photos aux clients
                </>
              )}
            </SecondaryButton>
          </div>
        )}

        {mode === "upload" && (
          <div className="flex flex-col gap-3 items-center justify-center">
            <FileUpload
              name="session-photos"
              accept="image/*"
              multiple
              disabled={isLoading}
              onChange={(files) => setSelectedFiles(files)}
            />
  
        
            <SecondaryButton
              onClick={uploadPhotos}
              disabled={isLoading || !selectedFiles.length}
              className=" flex items-center justify-center gap-2 min-w-28 py-2 px-4"
            >
              {isLoading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                  Téléchargement...
                </>
              ) : (
                "Téléverser"
              )}
            </SecondaryButton>   
             <p className="text-xs font-extralight opacity-70 text-center">{expirationText}</p>
          </div>
        )}

        {mode === "manage" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!photos.length && <p className="text-sm opacity-80">Aucune photo.</p>}
            {photos.map((photo) => (
              <div
                key={photo._id}
                className="relative bg-slate-900 rounded overflow-hidden border border-slate-700"
              >
                <img
                  src={photo.fileUrl}
                  alt={photo.fileName}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => deletePhoto(photo._id)}
                  disabled={isLoading}
                  className="absolute bottom-2 left-2 bg-black/65 hover:bg-red-600 transition-all text-white p-2 rounded-md disabled:opacity-50"
                  title="Supprimer la photo"
                >
                  <RiDeleteBin6Fill className="text-xl" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
