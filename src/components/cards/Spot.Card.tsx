"use client";

/*Librairies*/
import { Spin } from "antd";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";

/* Types */
import { ISpot } from "@/types";

/* Actions */
import { DELETE_SPOT } from "@/libs/ServerAction";

/* Components */
import {
  ToasterAction,
  ItemCard,
  ItemCardInner,
  ItemCardHeader,
  EditButton,
  DeleteButton,
} from "@/components";

/* store */
import { useSpots, useSessionWithDetails } from "@/store";

export function SpotCard({
  spot,
  updateSpotModal,
}: {
  spot: ISpot;
  updateSpotModal: (spot: ISpot) => void;
}) {
  const [isDelete, setIsDelete] = useState(false);
  const { deleteSpots } = useSpots();
  const { SessionWithDetails } = useSessionWithDetails();

  //get all sessions with this spot
  const sessionsWithSpot = SessionWithDetails.filter(
    (session) => session.spot._id === spot._id
  );

  const handleDelete = async () => {
    //check if the spot is used in a session
    if (sessionsWithSpot.length > 0) {
      toast.error(
        "Ce spot est déjà utilisé dans une session , vous ne pouvez pas le supprimer. Vous devez d'abord supprimer les sessions liées à ce spot"
      );
      return;
    }
    //if the spot is not used in a session , delete it
    const confirm = window.confirm("Voulez vous vraiment supprimer ce spot ?");
    if (confirm) {
      setIsDelete(true);
      const result = await DELETE_SPOT(spot._id);
      if (result.success) {
        deleteSpots(spot);
      } else {
        setIsDelete(false);
      }
      ToasterAction({ result, defaultMessage: "Lieu supprimé avec succès" });
    }
  };

  const MapCustomer = dynamic(
    () => import("@/components/modules/MapCustomer.modules"),
    {
      ssr: false,
    }
  );
  return (
    <ItemCard className="h-full px-0 pt-0  text-white flex flex-col md:flex-row gap-6 justify-between w-full max-w-[950px] relative">
      {isDelete && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-10 backdrop-blur-md flex flex-col gap-4 items-center justify-center">
          <Spin size="large" />
          <p className="text-white text-xl font-bold">
            Suppression du lieu en cours.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 justify-between w-full">
        {/* header */}

        <ItemCardHeader
          className={`relative flex items-center justify-center ${
            spot.photo ? "h-[200px]" : ""
          }`}
        >
          <h2
            className={`text-4xl font-bold text-center z-10 relative flex items-center justify-center ${
              spot.photo
                ? "bg-slate-300 rounded-md px-4 py-2  backdrop-blur-sm bg-opacity-45"
                : ""
            }`}
          >
            {spot.name}
          </h2>
          {spot.photo && (
            <Image
              src={spot.photo}
              alt={spot.name}
              width={600}
              height={200}
              className="w-full h-full object-cover absolute top-0 left-0 z-0 block rounded-md opacity-80 "
            />
          )}
        </ItemCardHeader>

        {/* content */}
        <div className="flex flex-col md:flex-row gap-2 justify-between md:px-4 h-full">
          <div className="flex flex-col justify-between w-full h-full gap-2">
            <p className="text-sm  dark:text-gray-300 text-center flex items-center justify-center h-full ">
              {spot.description || "Aucune description"}
            </p>
            <ItemCardInner className="flex gap-3 w-full items-center ">
              <h3 className=" font-bold text-center">Activités pratiquées:</h3>
              <div className={`grid grid-cols-1 gap-2  w-full`}>
                {spot.practicedActivities.map((activity) => (
                  <p key={activity.activityId}>{activity.activityName}</p>
                ))}
              </div>
            </ItemCardInner>
          </div>
          <MapCustomer spot={spot} />
        </div>

        {/* footer */}
        <div
          id="spot-card-footer"
          className="flex px-6 py-2  gap-3 w-full justify-end"
        >
          <EditButton onClick={() => updateSpotModal(spot)} />
          <DeleteButton onClick={handleDelete} />
        </div>
      </div>
    </ItemCard>
  );
}
