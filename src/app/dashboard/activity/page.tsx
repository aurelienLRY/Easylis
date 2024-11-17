"use client";

/* Librairies */
import React, { useState } from "react";

/* Components */
import { IconButton , ActivityCard , ActivityForm } from "@/components";

/* Icons */
import { IoMdAddCircle } from "react-icons/io";

/* Utils */
import { SearchInObject } from "@/utils/search.utils";

/* store */
import { useActivities } from "@/store";

/* Types */
import { IActivity } from "@/types";
/*hooks*/

import { useModal } from "@/hook";

type Props = {};

function ActivityPage({}: Props) {
  const activities = useActivities((state) => state.Activities);

  const [search, setSearch] = useState("");
  const [openCreateActivityForm, setOpenCreateActivityForm] = useState(false);
  const filteredActivities = SearchInObject(activities, search) as IActivity[];

  const updateActivity = useModal<IActivity>();

  return (
    <section className="flex flex-col gap-4 justify-center items-center w-full">
      <div className="flex justify-center items-center w-full">
        <IconButton
          title="Créer une activité"
          icon={<IoMdAddCircle className="text-4xl" />}
          onClick={() => {
            setOpenCreateActivityForm(true);
          }}
        />
      </div>

      <div className=" flex flex-col gap-4 w-full min-h-60 border-2 border-sky-700 dark:border-sky-900 rounded-md px-2 md:px-4 py-6">
        <div className="flex gap-2 justify-between">
          <div className="w-full flex justify-end">
            <input
              type="text"
              placeholder="🔎 Recherche"
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 bg-white py-2 px-6 text-base font-medium text-gray-700 outline-none transition-all duration-200"
            />
          </div>
        </div>
        <div className=" grid grid-cols-1 lg:grid-cols-2 justify-center items-center gap-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              updateActivityModal={updateActivity.openModal}
            />
          ))}
        </div>
      </div>

      {updateActivity.data ? (
        <ActivityForm
          data={updateActivity.data}
          isOpen={updateActivity.isOpen}
          onClose={updateActivity.closeModal}
        />
      ) : (
        <ActivityForm
          isOpen={openCreateActivityForm}
          onClose={() => {
            setOpenCreateActivityForm(false);
          }}
        />
      )}
    </section>
  );
}

export default ActivityPage;
