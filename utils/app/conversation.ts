import { Conversation } from '@/types/chat';

// 更新chat conversation
export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};
// 保存chat selected conversation
export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};
// 保存chat conversations
export const saveConversations = (conversations: Conversation[]) => {
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
};

// 更新bot conversation
export const updateBotConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveBotConversation(updatedConversation);
  saveBotConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};
// 保存bot selected conversation
export const saveBotConversation = (conversation: Conversation) => {
  localStorage.setItem('botSelectedConversation', JSON.stringify(conversation));
};
// 保存bot conversations
export const saveBotConversations = (conversations: Conversation[]) => {
  localStorage.setItem('botConversationHistory', JSON.stringify(conversations));
};
