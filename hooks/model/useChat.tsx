import { useState } from 'react';

export const useChat = () => {
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  return {
    showScrollDownButton,
    setShowScrollDownButton
  };
};
