"use client";

/* LIBRAIRIES */
import { Tooltip } from "antd";
import React, { useEffect } from "react";

/*icons*/
import { IoMdCloseCircle } from "react-icons/io";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

/**
 * Modal Component
 * @param {boolean} isOpen - Indicateur d'ouverture de la modal.
 * @param {() => void} onClose - Fonction de fermeture de la modal.
 * @param {React.ReactNode} children - Les enfants du composant.
 * @returns {JSX.Element} Le composant modal.
 */
export const Modal = ({ isOpen, onClose, children, title }: Props) => {
  const handleClose = () => {
    onClose();
  };

  /**
   * HandleEscape Function
   * @param {KeyboardEvent} e - L'événement clavier.
   * @returns {void}
   */
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Utilisation de useEffect pour ajouter et nettoyer l'événement keydown
  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/*overlay*/}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-40  ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {/*modal*/}
        <div className="min-w-[350px] w-fit max-w-[90vw] md:min-w-[500px] lg:min-w-[600px] lg:max-w-[70vw] max-h-[90vh] overflow-y-auto bg-gray-800 dark:bg-sky-950 rounded-md shadow-md shadow-slate-400 dark:shadow-sky-400">
          <div className="flex justify-evenly items-center bg-gray-600 rounded-t-md w-full py-2">
            <div className=" h-7 flex  items-center px-3">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <div className="flex justify-center items-center w-full">
              <h2 className="text-xl md:text-2xl md:font-bold">{title}</h2>
            </div>

            <Tooltip title="Fermer">
              <button onClick={handleClose}>
                <IoMdCloseCircle className="text-4xl text-white text-right p-1 hover:text-red-500 transition-all duration-300" />
              </button>
            </Tooltip>
          </div>
          <div className="px-2 pb-6 mt-4 flex justify-center items-center w-full overflow-x-scroll">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
