'use-client'

import { useSession } from "next-auth/react";
import { useModel } from '@/hooks';
import useApiService from '@/services/useApiService';
import { getEndpoint } from '@/utils/app/api';
import message from 'antd/lib/message';
import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { throttle } from '@/utils/data/throttle';
import { ChatBody, Conversation, Message } from '@/types/chat';
import HomeContext from '@/pages/api/home/home.context';
import { getMeta, ENVS, accessToken } from '@/constants';
import { calTokenLength } from '@/utils/tiktoken';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { ChatInput } from '../ChatInput';

import Chat, { Bubble, useMessages, MessageProps } from "@chatui/core";

// 引入样式
import '@chatui/core/dist/index.css';

// const a = {
//   content: {text: '你好'}
//   createdAt: 1696681844282
//   hasTime: true
//   position: "right"
//   type: "text"
//   _id: "4uhfuhdqs5ig"
// };

// const b = {
//   content: "你好"
//   role: "user"
// };

// chatui的message格式转换openai格式
const chatToBotConverter = (chatMessage: MessageProps[]) => {
  return chatMessage.map((message: MessageProps) => {
    const { content, position, ...others } = message;
    return {
      content: content.text,
      role: position === 'right' ? 'user' : 'assistant'
    };
  });
}

const messageComp = message;

const messageMapUtil = (messages: Message[]) => {
  return messages.map(m => {
    const { hide, ...restM } = m;
    return restM;
  });
}

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
  botMode: any;
}

const ChatBot = memo(({ stopConversationRef, botMode }: Props) => {
  const {
    state: {
      apiKey,
    },
  } = useContext(HomeContext);
  const { status, data: session } = useSession();

  const { fetchUserInfoMethod, requestUpdateUserAccount, setVoiceMessage, user, voiceModeOpen } = useModel('global');
  const { showScrollDownButton } = useModel('chat');
  const {
    setBotCurrentMessage,
    botSelectedConversation,
    botConversations,
    setBotSelectedConversationMessages,
    initedBotConver
  } = useModel('bot');

  // 延迟导入chatui
  let Chat, Bubble: any, useMessages, MessageProps;
  if (typeof window !== 'undefined') {
    const chatui = require('@chatui/core');
    Chat = chatui.default;
    Bubble = chatui.Bubble;
    useMessages = chatui.useMessages;
    MessageProps = chatui.MessageProps;
  }
  const { messages, prependMsgs, resetList, appendMsg, setTyping } = useMessages([]);
  // 初始化chatui messages
  useEffect(() => {
    // prependMsgs(botSelectedConversation?.messages);
    const messages = !!initedBotConver?.messages?.length ? initedBotConver?.messages : [{
      type: 'text',
      content: { text: '主人好，我是智能助理，你的贴心小助手~' },
      user: { name: '助理', avatar: '/images/bot.svg' },
    }];
    resetList(messages);
  }, [initedBotConver]);

  useEffect(() => {
    setBotSelectedConversationMessages(messages);
  }, [messages]);

  const signedIn = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';
  const balance = user?.account?.balance || 0;

  useEffect(() => {
    fetchUserInfoMethod(signedIn?.id);
  }, [signedIn]);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    botSelectedConversation &&
      setBotCurrentMessage(
        botSelectedConversation.messages[botSelectedConversation.messages.length - 2],
      );
  }, [botSelectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  const handleSend = useCallback(
    async (type: string, val: string) => {
      if (type === 'text' && val.trim()) {
        appendMsg({
          type: 'text',
          content: { text: val },
          user: { name: '我', avatar: '/images/user.svg' },
          position: 'right',
        });
      } else {
        appendMsg({
          type,
          content: { text: val },
          user: { name: '我', avatar: '/images/user.svg' },
          position: 'right',
        });
      }
      const message = { role: 'user', content: val };

      if (botSelectedConversation) {
        let updatedConversation: Conversation;
        let newMessage = [...chatToBotConverter(botSelectedConversation.messages), message];
        updatedConversation = {
          ...botSelectedConversation,
          messages: newMessage,
        };
        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: messageMapUtil(updatedConversation.messages),
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          userId: signedIn?.id || '',
          balance,
        };
        const endpoint = getEndpoint(null);

        let body = JSON.stringify(chatBody);;
        const controller = new AbortController();

        const { tokenCount: sentTokenCount } = await calTokenLength(chatBody);
        const subBalance = Math.round(sentTokenCount / 10);
        const newBalance = (balance || 0) - subBalance;

        if (newBalance < 0) {
          setTyping(false);
          messageComp.error('剩余算力不够，请充值');
          return;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        let promptToSend = chatBody.prompt;
        if (!promptToSend) {
          promptToSend = DEFAULT_SYSTEM_PROMPT;
        }

        if (!response.ok) {
          // homeDispatch({ field: 'loading', value: false });
          let toastMsg = response.statusText;
          if (response.status === 403) toastMsg = '剩余算力不够，请充值';
          messageComp.error(toastMsg);
          return;
        }
        // 更新发送token的算力消耗
        requestUpdateUserAccount(signedIn?.id, { tokenCount: sentTokenCount }).then((res: any) => {
          if (!res.success) {
            setTyping(false);
            let toastMsg = res.statusText;
            if (res.status === 403) toastMsg = '剩余算力不够，请充值';
            messageComp.error(toastMsg);
          }
        });

        const data = response.body;
        if (!data) {
          setTyping(false);
          return;
        }
        // 扣除balance后请求一次最新user
        fetchUserInfoMethod(signedIn?.id);

        setTyping(false);
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';
        while (!done) {
          if (stopConversationRef.current === true) {
            controller.abort();
            done = true;
            break;
          }
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          text += chunkValue;
          if (isFirst) {
            isFirst = false;
            // 第一次回复使用 appendMsg

          } else {
            // 后续流式回复使用 updateMsg
            // updateMsg(messages[messages.length - 1]?._id || '', {
            //   type: 'text',
            //   content: { text },
            // });
          }
        }
        appendMsg({
          type: 'text',
          content: { text },
          user: { name: '助理', avatar: '/images/bot.svg' },
        });
        fetchUserInfoMethod(signedIn?.id);
        // 更新回复token的算力消耗
        const { tokenCount: responseTokenCount } = await calTokenLength({ ...chatBody, messages: [{ content: text, role: 'assistant' }] }, false);
        // 语音回复模式处理逻辑
        if (voiceModeOpen) {
          if (responseTokenCount < 100) {
            setVoiceMessage(text);
          } else {
            messageComp.info('文字过长无法语音回答');
          }
        }
        // 更新token使用情况
        await requestUpdateUserAccount(signedIn?.id, { tokenCount: responseTokenCount, isSend: false });
      }
    },
    [
      apiKey,
      botConversations,
      botSelectedConversation,
      stopConversationRef,
      signedIn,
      balance,
      messages,
      voiceModeOpen,
    ],
  );

  const renderMessageContent = (msg: MessageProps) => {
    const { type, content } = msg;
    // 根据消息类型来渲染
    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      case 'image':
        return (
          <Bubble type="image">
            <img src={content.text} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }
  if (typeof window === 'undefined' || !Chat || !Bubble) {
    return <div>Loading...</div>;  // 或其他的占位内容
  }
  //   export declare type ComposerProps = {
  //     wideBreakpoint?: string;
  //     text?: string;
  //     inputOptions?: InputProps;
  //     placeholder?: string;
  //     inputType?: InputType;
  //     onInputTypeChange?: (inputType: InputType) => void;
  //     recorder?: RecorderProps;
  //     onSend: (type: string, content: string) => void;
  //     onImageSend?: (file: File) => Promise<any>;
  //     onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  //     onChange?: (value: string, event: React.ChangeEvent<Element>) => void;
  //     onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  //     toolbar?: ToolbarItemProps[];
  //     onToolbarClick?: (item: ToolbarItemProps, event: React.MouseEvent) => void;
  //     onAccessoryToggle?: (isAccessoryOpen: boolean) => void;
  //     rightAction?: IconButtonProps;
  // };
  return (
    <Chat
      // navbar={botMode ? undefined : { title: '智能助理' }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      // quickReplies={defaultQuickReplies}
      // onQuickReplyClick={handleQuickReplyClick}
      // onSend={handleSend}
      Composer={() => <ChatInput
        stopConversationRef={stopConversationRef}
        textareaRef={textareaRef}
        onSend={(msg: any, _, type = 'text') => {
          setBotCurrentMessage({
            type,
            content: msg.content,
          });
          handleSend(type, msg.content);
        }}
        onScrollDownClick={handleScrollDown}
        showScrollDownButton={showScrollDownButton}
      />}
    />
  );
});
ChatBot.displayName = 'ChatBot';


export default ChatBot;
