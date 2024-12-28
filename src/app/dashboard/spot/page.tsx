"use client";
import React, { useState, useEffect } from "react";

/* components */
import { SpotCard, ItemContainer, SpotForm, IconButton } from "@/components";

/* Icons */
import { IoMdAddCircle } from "react-icons/io";

/* store */
import { useSpots, useActivities } from "@/store";

/* utils */
import { SearchInObject } from "@/utils/search.utils";

/* types */
import { ISpot, IActivity } from "@/types";
/* hooks */

import { useModal } from "@/hooks";

type Props = {};

function SpotPage({}: Props) {
  const spots = useSpots((state) => state.Spots);
  const activities = useActivities((state) => state.Activities);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedActivity, setSelectedActivity] = useState<string | null>(
    "all"
  );
  const [filteredSpots, setFilteredSpots] = useState<ISpot[]>(spots);
  const updateSpot = useModal<ISpot>();

  useEffect(() => {
    if (selectedActivity) {
      let filteredSpots = filterSpotsByActivities(spots, selectedActivity);
      filteredSpots = SearchInObject(filteredSpots, search) as ISpot[];
      setFilteredSpots(filteredSpots);
    }
  }, [selectedActivity, search, spots]);

  return (
    <section className="flex flex-col gap-4 justify-center items-center w-full">
      <div className="flex justify-center items-center w-full">
        <IconButton
          title="Créer un lieu"
          icon={<IoMdAddCircle className="text-4xl" />}
          onClick={() => setOpenModalCreate(true)}
        />
      </div>
      <ItemContainer className="flex flex-col gap-4 w-full min-h-60 ">
        <div className="flex flex-col-reverse items-center lg:flex-row gap-2 lg:justify-between">
          <div className="flex gap-0 flex-col  items-center md:items-start  md:justify-center ">
            <h3 className=" text-lg text-start ms-2 opacity-50">Activités</h3>
            <div className="flex-wrap flex justify-center gap-4 text-xs min-h-6 font-light bg-sky-950 dark:bg-sky-800 rounded-md py-2 px-2 md:px-4 box-content max-w-fit">
              <button
                className={`py-2 px-2  rounded-md ${
                  selectedActivity === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                onClick={() => setSelectedActivity("all")}
              >
                Toutes
              </button>
              {activities.map((activity: IActivity) => (
                <button
                  key={activity._id}
                  className={`py-2 px-2 rounded-md ${
                    selectedActivity === activity._id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  onClick={() => setSelectedActivity(activity._id as string)}
                >
                  {activity.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center">
            <input
              type="text"
              placeholder="🔎 Recherche"
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 bg-white py-2 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className=" grid grid-cols-1 xl:grid-cols-2 justify-items-center  gap-4">
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot._id}
              spot={spot}
              updateSpotModal={updateSpot.openModal}
            />
          ))}
        </div>
      </ItemContainer>

      {updateSpot.data ? (
        <SpotForm
          data={updateSpot.data}
          isOpen={updateSpot.isOpen}
          onClose={updateSpot.closeModal}
        />
      ) : (
        <SpotForm
          isOpen={openModalCreate}
          onClose={() => setOpenModalCreate(false)}
        />
      )}
    </section>
  );
}

export default SpotPage;

// function qui filtre les lieux par activités
function filterSpotsByActivities(spots: ISpot[], activityId: string) {
  if (!activityId) return spots;
  if (activityId === "all") return spots;
  return spots.filter((spot) => {
    return spot.practicedActivities.some(
      (activity: any) => activity.activityId === activityId
    );
  });
}
