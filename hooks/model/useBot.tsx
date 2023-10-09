import { useState } from 'react';
import { Conversation } from '@/types/chat';
import { MessageProps } from '@chatui/core';
import {
  saveBotConversation,
  saveBotConversations,
} from '@/utils/app/conversation';

// 聊天机器人
export const useBot = () => {
  const [botConversations, setBotConversations] = useState<Conversation[]>([]);
  const [botSelectedConversation, setBotSelectedConversation] = useState<Conversation | undefined>(undefined);
  // 用于初始化chatui的message，值等同于botSelectedConversation
  const [initedBotConver, setInitedBotConver] = useState<Conversation | undefined>(undefined);
  const [botCurrentMessage, setBotCurrentMessage] = useState<MessageProps | undefined>(undefined);
  const [isInited, setIsInited] = useState<boolean>(false);

  // 调用场景
  const callSetInitedBotConver = (payload: Conversation | undefined) => {
    setBotSelectedConversation(payload);
    setInitedBotConver(payload);
  }

  // 设置botSelectedConversation的messages属性
  const setBotSelectedConversationMessages = (messages: any) => {
    if (botSelectedConversation) {
      console.log('botSelectedConversation', botSelectedConversation);
      let name = botSelectedConversation.role?.name ?? '助理';
      const updateBotSelectedConversation = {
        ...botSelectedConversation,
        messages,
        name,
      };

      setBotSelectedConversation(updateBotSelectedConversation);
      saveBotConversation(updateBotSelectedConversation);

      const updatedConversations: Conversation[] = botConversations.map(
        (conversation: any) => {
          if (conversation.id === botSelectedConversation.id) {
            return updateBotSelectedConversation;
          }
          return conversation;
        },
      );
      if (updatedConversations.length === 0) {
        updatedConversations.push(updateBotSelectedConversation);
      }
      setBotConversations(updatedConversations);
      saveBotConversations(updatedConversations);
    }
  }

  return {
    botConversations,
    setBotConversations,
    botSelectedConversation,
    setBotSelectedConversation,
    botCurrentMessage,
    setBotCurrentMessage,
    setBotSelectedConversationMessages,
    isInited,
    setIsInited,
    initedBotConver,
    setInitedBotConver,
    callSetInitedBotConver,
  };
};
