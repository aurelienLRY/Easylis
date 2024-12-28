import React from "react";
import { Tooltip, Spin } from "antd";

/*icons */
import { BiEditAlt } from "react-icons/bi";
import { FaRegEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FiRefreshCcw } from "react-icons/fi";

/**
 * Ce composant représente un bouton personnalisé avec une icône.
 * Il utilise un `Tooltip` de Material-UI pour afficher un titre lorsque l'utilisateur survole le bouton.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.title - Le titre à afficher dans le tooltip.
 * @param {React.ReactElement} props.icon - L'icône à afficher dans le bouton.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @returns {JSX.Element} Le composant bouton avec tooltip.
 */
export const IconButton = ({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactElement;
  onClick: () => void;
}) => {
  return (
    <Tooltip title={title}>
      <button
        onClick={onClick}
        className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 text-white px-4 py-2 rounded-md text-sm flex flex-col gap-2 items-center justify-center min-w-20 min-h-20 group hover:rotate-12 "
      >
        {React.cloneElement(icon, {
          className:
            "text-4xl group-hover:scale-125  group-hover:-rotate-12 transition-all duration-300",
        })}
      </button>
    </Tooltip>
  );
};

/**
 * Ce composant représente un bouton d'édition.
 * Il utilise un `Tooltip` de Material-UI pour afficher un titre lorsque l'utilisateur survole le bouton.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} [props.title] - Le titre à afficher dans le tooltip.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @param {string} [props.className] - Classes CSS supplémentaires pour le bouton.
 * @param {React.ReactNode} [props.children] - Les enfants à afficher à l'intérieur du bouton.
 * @returns {JSX.Element} Le composant bouton d'édition avec tooltip.
 */
export const EditButton = ({
  title,
  onClick,
  className,
  children,
}: {
  title?: string;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Tooltip title={`${title ? title : "Modifier"}`}>
      <button onClick={onClick} className={`text-2xl group ${className}`}>
        <BiEditAlt className="group-hover:text-orange-600 transition-all duration-300" />
        {children}
      </button>
    </Tooltip>
  );
};

/**
 * Ce composant représente un bouton de détail.
 * Il utilise un `Tooltip` de Material-UI pour afficher un titre lorsque l'utilisateur survole le bouton.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} [props.title] - Le titre à afficher dans le tooltip.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @param {string} [props.className] - Classes CSS supplémentaires pour le bouton.
 * @param {React.ReactNode} [props.children] - Les enfants à afficher à l'intérieur du bouton.
 * @returns {JSX.Element} Le composant bouton de détail avec tooltip.
 */
export const DetailButton = ({
  title,
  onClick,
  className,
  children,
}: {
  title?: string;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Tooltip title={`${title ? title : "Voir le détail"}`}>
      <button onClick={onClick} className={`text-2xl group ${className}`}>
        <FaRegEye className="group-hover:text-slate-200 transition-all duration-300 " />
        {children}
      </button>
    </Tooltip>
  );
};

/**
 * Ce composant représente un bouton de suppression.
 * Il utilise un `Tooltip` de Material-UI pour afficher un titre lorsque l'utilisateur survole le bouton.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} [props.title] - Le titre à afficher dans le tooltip.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @param {string} [props.className] - Classes CSS supplémentaires pour le bouton.
 * @param {React.ReactNode} [props.children] - Les enfants à afficher à l'intérieur du bouton.
 * @returns {JSX.Element} Le composant bouton de suppression avec tooltip.
 */
export const DeleteButton = ({
  title,
  onClick,
  className,
  children,
  isSubmitting = false,
}: {
  title?: string;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  isSubmitting?: boolean;
}) => {
  return (
    <Tooltip title={`${title ? title : "Supprimer"}`}>
      <button
        onClick={onClick}
        className={`text-2xl group ${className}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Spin size="small" className="text-red-500" />
        ) : (
          <MdDelete className="group-hover:text-red-500 transition-all duration-300 " />
        )}
        {children}
      </button>
    </Tooltip>
  );
};

export const RefreshButton = ({
  title,
  onClick,
  className,
  children,
  isLoading = false,
}: {
  title?: string;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}) => {
  return (
    <Tooltip title={`${title ? title : "Rafraîchir"}`}>
      <button onClick={onClick} className={`text-2xl group ${className}`}>
        {isLoading ? (
          <Spin size="small" className="text-slate-200" />
        ) : (
          <FiRefreshCcw className="group-hover:text-slate-200 transition-all duration-300" />
        )}
        {children}
      </button>
    </Tooltip>
  );
};

/**
 * Ce composant représente un bouton primaire.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.title - Le titre à afficher dans le bouton.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @param {string} [props.className] - Classes CSS supplémentaires pour le bouton.
 * @param {React.ReactNode} [props.children] - Les enfants à afficher à l'intérieur du bouton.
 * @returns {JSX.Element} Le composant bouton primaire.
 */
export const PrimaryButton = ({
  title,
  onClick,
  className,
  children,
  type,
  disabled = false,
}: {
  title?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) => {
  return (
    <button
      className={`bg-sky-800 dark:bg-sky-900 p-1 rounded-md ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {title}
      {children}
    </button>
  );
};

/** Ce composant représente un bouton secondaire.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.title - Le titre à afficher dans le bouton.
 * @param {() => void} props.onClick - La fonction à exécuter lorsque le bouton est cliqué.
 * @param {string} [props.className] - Classes CSS supplémentaires pour le bouton.
 * @param {React.ReactNode} [props.children] - Les enfants à afficher à l'intérieur du bouton.
 * @returns {JSX.Element} Le composant bouton secondaire.
 */
export const SecondaryButton = ({
  title,
  type,
  onClick,
  className,
  children,
  disabled = false,
}: {
  title?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}) => {
  return (
    <button
      className={`bg-orange-600 hover:bg-orange-700 transition-all duration-300 p-1 rounded-md  ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {title}
      {children}
    </button>
  );
};
