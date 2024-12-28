"use client";
/*libs*/
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { Spin } from "antd";

/* actions */
import { UPDATE_USER } from "@/libs/ServerAction";
/*components*/
import { ToasterAction } from "@/components";

/* types */
import { IUser } from "@/types";
import { toast } from "sonner";
/* store */
import { useProfile } from "@/store";
/* icons */
import { FaCloudUploadAlt } from "react-icons/fa";

/**
 * Ce composant gère le système d'avatar pour les utilisateurs.
 * Il permet aux utilisateurs de télécharger une nouvelle image d'avatar,
 * de prévisualiser l'image avant de la soumettre et de mettre à jour leur profil utilisateur avec la nouvelle image.
 * @returns AvatarSystem
 */
export const AvatarSystem = () => {
  const { profile, updateProfile } = useProfile();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/img/default-avatar.webp"
  );
  const [isUploaded, setIsUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle image change
   * @param e - The event
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarUrl(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("avatar", file, file.name);
      handleSubmit(formData); // Ajouter l'image à formData et soumettre
    }
  };

  /**
   * Handle form submit
   * @param formData - The form data
   */
  const handleSubmit = async (formData: FormData) => {
    console.log("formData", formData);
    setIsSubmitting(true);
    // Envoie l'image au serveur
    const fetchAvatar = await fetch("/api/uploadFiles", {
      method: "POST",
      body: formData,
    });
    // Récupère le résultat de l'envoie de l'image
    const result = await fetchAvatar.json();
    if (result.success) {
      setIsUploaded(true);

      // Met à jour l'utilisateur en bdd
      const updateUser = await UPDATE_USER(
        profile?._id as string,
        {
          ...profile,
          avatar: result.data?.path as string,
        } as IUser
      );

      if (updateUser.success) {
        updateProfile({
          ...profile,
          avatar: result.data?.path as string,
        } as IUser);
      }
      setIsUploaded(false);

      // Affiche le toast d'état de l'opération
      ToasterAction({
        result: updateUser,
        defaultMessage: "Image téléchargée avec succès",
      });
    } else {
      toast.error("Erreur lors du téléchargement de l'image");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (profile?.avatar) {
      checkAvatarExists(`/${profile?.avatar}`).then((url) => {
        setAvatarUrl(url);
      });
    }
  }, [profile]);

  return (
    <form action={handleSubmit} className="flex flex-col items-center">
      <div className="relative">
        <Tooltip title="Changer mon avatar">
          <label htmlFor="avatar-input" className="cursor-pointer group">
            <Image
              src={avatarUrl}
              alt="Preview"
              width={100}
              height={100}
              className="rounded-full object-cover h-24 w-24"
            />
            {isSubmitting ? (
              <Spin className="absolute h-8 w-8 bottom-0 right-3" />
            ) : isUploaded ? (
              <Spin className=" text-green-500" />
            ) : (
              <FaCloudUploadAlt className="absolute h-8 w-8 bottom-0 right-3 text-slate-300 hover:text-slate-500 cursor-pointer transition-all duration-300 group-hover:bottom-1 group-hover:text-slate-500" />
            )}
            <input
              id="avatar-input"
              type="file"
              name="avatar"
              accept="image/webp, image/png, image/jpg, image/jpeg"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </Tooltip>
      </div>
    </form>
  );
};

/**
 * Fonction qui vérifie si l'url de l'avatar existe et présent dans le dossier public sinon retourne l'avatar par défaut
 * @param avatarUrl - url de l'avatar
 * @returns url de l'avatar ou url de l'avatar par défaut
 */
export async function checkAvatarExists(avatarUrl: string) {
  try {
    const response = await fetch(avatarUrl);
    if (
      response.ok &&
      response.headers.get("content-type")?.includes("image")
    ) {
      return avatarUrl;
    } else {
      return "/img/default-avatar.webp";
    }
  } catch (error) {
    return "/img/default-avatar.webp";
  }
}
