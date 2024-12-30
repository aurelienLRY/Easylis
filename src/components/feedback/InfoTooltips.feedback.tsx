import React from "react";
import { Tooltip } from "antd";
import { BsExclamationCircle } from "react-icons/bs";

type Props = {
  title: string;
};
/**
 * Ce composant représente un tooltip d'information.
 * @param {string} title - Le titre du tooltip.
 * @returns {JSX.Element} Le composant tooltip d'information.
 */
export const InfoTooltips = ({ title }: Props) => {
  return (
    <Tooltip title={title}>
      <span className="cursor-pointer">
        <BsExclamationCircle className="text-sky-500 text-lg" />
      </span>
    </Tooltip>
  );
};
