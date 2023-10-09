'use-client'

import { useSession } from "next-auth/react";
import { useModel } from '@/hooks';
import {
  MutableRefObject,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { throttle } from '@/utils/data/throttle';
import { ChatInput } from '../ChatInput';

import { MessageProps } from "@chatui/core";

// 引入样式
import '@chatui/core/dist/index.css';

// const chatuimessage = {
//   content: {text: '你好'}
//   createdAt: 1696681844282
//   hasTime: true
//   position: "right"
//   type: "text"
//   _id: "4uhfuhdqs5ig"
// };

// const openai = {
//   content: "你好"
//   role: "user"
// };

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
  botMode: any;
  logicOnly: boolean;
  resetList: any;
  Bubble: any;
  Chat: any;
  messages: MessageProps;
  handleSend: any;
}

const ChatBot = memo(({
  resetList,
  Bubble,
  Chat,
  messages,
  handleSend,
  stopConversationRef,
}: Props) => {
  const { data: session } = useSession();

  const { fetchUserInfoMethod, user } = useModel('global');
  const { showScrollDownButton } = useModel('chat');
  const {
    setBotCurrentMessage,
    botSelectedConversation,
    setBotSelectedConversationMessages,
    initedBotConver
  } = useModel('bot');
  // 初始化chatui messages
  useEffect(() => {
    // prependMsgs(botSelectedConversation?.messages);
    let messages = !!initedBotConver?.messages?.length ? initedBotConver?.messages : [{
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
