import { useSession } from "next-auth/react";
import { useModel } from '@/hooks';
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
import dynamic from 'next/dynamic'
import { ChatBody, Conversation, Message } from '@/types/chat';
import HomeContext from '@/pages/api/home/home.context';
import { getMeta, ENVS, accessToken } from '@/constants';
import {
  IconFeather,
  IconBulb,
  IconSchool
} from '@tabler/icons-react';
import Spinner from '../../Spinner';
import { ChatInput } from '../ChatInput';
import { ChatLoader } from '../ChatLoader';


const MemoizedChatMessage = dynamic(() => import('../MemoizedChatMessage'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
  handleSend: any;
  handleScroll: any;
}

const defaultPrompt = [
  {
    title: 'AI 创作',
    icon: <IconFeather />,
    promptList: ['写一首赞美祖国的诗', '写一篇科幻小说', '安排一场发布会流程'],
  },
  {
    title: '有趣的提问',
    icon: <IconBulb />,
    promptList: ['有哪些有趣的科学实验', '问一个AI也答不出的问题', 'AI会替代人类工作吗'],
  },
  {
    title: 'AI 百科',
    icon: <IconSchool />,
    promptList: ['简单解释一下人工智能', '红烧牛肉的做法', '请介绍一下新冠'],
  },
];

const WelcomePanel = () => {
  const meta = getMeta(window.location.href || '');
  const { title } = meta;

  return (
    <div className="max-w-full md:w-[650px] h-full mx-auto md:mt-20 mt-0">
      <div className="text-4xl text-gray-600 text-center leading-relaxed my-8 font-semibold tracking-wider transition-colors duration-100 ease-in-out">{title}</div>
      <div className="flex justify-around p-2.5">
        {defaultPrompt.map((section) => <div className="w-1/3 px-2.5 text-center">
          <div className="mb-[20px] flex flex-col items-center text-gray-600 transition-colors duration-100 ease-in-out">
            {section.icon}
            <div className="text-base leading-10">{section.title}</div>
          </div>
          <ul>{section.promptList.map((prompt) => (
            <li className="rounded mb-4 py-3 md:px-4 px-2 text-sm leading-5 cursor-default transition-background duration-100 ease-in-out list-none bg-gray-100 text-gray-600">{prompt}</li>
          ))}</ul>
        </div>)}
      </div>
    </div>
  )
}

export const ChatCommunication = memo(({ stopConversationRef, handleSend, handleScroll }: Props) => {
  const {
    state: {
      selectedConversation,
      loading,
      prompts,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { status, data: session } = useSession();
  const { fetchUserInfoMethod } = useModel('global');
  const { showScrollDownButton } = useModel('chat');

  const signedIn = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  useEffect(() => {
    fetchUserInfoMethod(signedIn?.id);
  }, [signedIn]);

  const [currentMessage, setCurrentMessage] = useState<Message>();
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

  // useEffect(() => {
  //   console.log('currentMessage', currentMessage);
  //   if (currentMessage) {
  //     handleSend(currentMessage);
  //     homeDispatch({ field: 'currentMessage', value: undefined });
  //   }
  // }, [currentMessage]);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

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

  const showMessageArea = !!selectedConversation?.messages.length;
  return (
    <>
      <div
        className="max-h-full overflow-x-hidden"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <div className="relative flex flex-col h-full overflow-hidden bg-white dark:bg-[#343541]">
          {showMessageArea ? <>
            {selectedConversation?.messages.map((message, index) => (
              <MemoizedChatMessage
                key={index}
                message={message}
                messageIndex={index}
                onEdit={(editedMessage) => {
                  setCurrentMessage(editedMessage);
                  // discard edited message and the ones that come after then resend
                  handleSend(
                    editedMessage,
                    selectedConversation?.messages.length - index,
                  );
                }}
              />
            ))}

            {loading && <ChatLoader />}

            <div
              className="h-[162px] bg-white dark:bg-[#343541]"
              ref={messagesEndRef}
            />
          </> : <WelcomePanel />}
        </div>
      </div>
      <ChatInput
        stopConversationRef={stopConversationRef}
        textareaRef={textareaRef}
        onSend={(message, plugin) => {
          setCurrentMessage(message);
          handleSend(message, 0, plugin);
        }}
        onScrollDownClick={handleScrollDown}
        onRegenerate={() => {
          if (currentMessage) {
            handleSend(currentMessage, 2, null);
          }
        }}
        onRepeat={() => {
          if (currentMessage) {
            const newMessage = { ...currentMessage, content: '重新生成回应' };
            handleSend(newMessage, 0, null);
          }
        }}
        onContinue={() => {
          if (currentMessage) {
            const newMessage = { ...currentMessage, content: '继续' };
            handleSend(newMessage, 0, null);
          }
        }}
        showScrollDownButton={showScrollDownButton}
      />
    </>
  );
});
ChatCommunication.displayName = 'ChatCommunication';
