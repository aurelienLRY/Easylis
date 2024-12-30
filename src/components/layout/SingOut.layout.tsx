/*libraries*/
import React from "react";
import { signOut } from "next-auth/react";
import { Tooltip } from "antd";

/*icons*/
import { FaSignOutAlt } from "react-icons/fa";

/**
 * SingOutBtn Component
 * @returns {JSX.Element} Le composant bouton de déconnexion.
 */
export function SingOutBtn() {
  return (
    <div className="flex justify-center items-center fixed bottom-10 translate-y-1/2 left-0 rotate-180 md:rotate-0 md:left-auto md:right-0 p-1 bg-stone-700 rounded-s-lg opacity-70 hover:opacity-100 transition-opacity duration-300 z-50 overflow-hidden">
      <div className="group relative">
        <Tooltip title="se déconnecter">
          <button
            onClick={() => signOut()}
            className=" text-white text-sm p-2 rounded-md "
          >
            <FaSignOutAlt />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
