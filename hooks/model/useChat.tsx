import { useState } from 'react';
import { Conversation } from '@/types/chat';

export const useChat = () => {
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  return {
    showScrollDownButton,
    setShowScrollDownButton,
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations
  };
};
