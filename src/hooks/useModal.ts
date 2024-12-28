"use client";

import { useState } from "react";

function useModal<T>() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);

  const openModal = (modalData?: T) => {
    if (modalData) {
      setData(modalData);
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    isOpen,
    data,
    openModal,
    closeModal,
  };
}

export { useModal };
