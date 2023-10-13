import message from 'antd/lib/message';
import { useSession } from "next-auth/react";
import { useModel } from '@/hooks';
import { isMobile } from '@/utils/app';
import { SettingDialog } from '@/components/Settings/SettingDialog';
import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useTranslation } from 'next-i18next';
import { getEndpoint } from '@/utils/app/api';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';
import dynamic from 'next/dynamic'
import { ChatBody, Conversation, Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';
import HomeContext from '@/pages/api/home/home.context';
import { getMeta, ENVS, accessToken } from '@/constants';
import Spinner from '../../Spinner';
import { ErrorMessageDiv } from '../ErrorMessageDiv';
import useApiService from '@/services/useApiService';
import { calTokenLength } from '@/utils/tiktoken';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { CharacterAudioPlayer } from '@/components/Audio';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { ChatTool } from './ChatTool';
import { ChatCommunication } from './ChatCommunication';
// import ChatBot from './ChatBot';
import styles from './styles.module.css'

// import { SystemPrompt } from './SystemPrompt';
// import { TemperatureSlider } from './Temperature';

const messageComp = message;

const ModelSelect = dynamic(() => import('../ModelSelect'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});

const DynamicChatBot = dynamic(() => import('./ChatBot'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

const messageMapUtil = (messages: Message[]) => {
  return messages.map(m => {
    const { hide, ...restM } = m;
    return restM;
  });
}

// chatui的message格式转换openai格式
const chatToBotConverter = (chatMessage: any) => {
  return chatMessage.map((message: any) => {
    const { content, position, ...others } = message;
    return {
      content: content.text,
      role: position === 'right' ? 'user' : 'assistant'
    };
  });
}

export const Main = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      models,
      apiKey,
      modelError,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { status, data: session } = useSession();
  const { fetchUserInfoMethod, user, requestUpdateUserAccount, voiceModeOpen, setMessageIsStreaming, setVoiceMessage, activeMenu, setActiveMenu, pluginKeys, isBotMode } = useModel('global');
  const { getContentSecurity } = useApiService();
  const signedIn = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';
  const balance = user?.account?.balance || 0;

  const meta = getMeta(window.location.href || '');
  const { env, role: defaultRole } = meta;

  const { selectedConversation, setSelectedConversation, conversations, setConversations } = useModel('chat');
  const { botSelectedConversation, botConversations } = useModel('bot');

  const router = useRouter()
  // isChatMode: 仅聊天对话模式
  const { botMode } = router.query

  // 需要做文案审核
  const needContentContraints = env === ENVS.normal || env === ENVS.hebao;

  const unauthorizationToLogin = () => {
    if (status === 'unauthenticated') {
      messageComp.open({
        type: 'warning',
        duration: 5,
        className: styles.unaothorizationMessage,
        content: (
          <div className='inline-block'><span>请先完成</span><button onClick={() => signIn()} className="text-blue-600 cursor-pointer hover:opacity-50">
            登陆
          </button>
          </div>)
      })
    }
  }

  useEffect(() => {
    fetchUserInfoMethod(signedIn?.id);
  }, [signedIn]);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleBotSend = useCallback(
    async (type: string, val: string, selectedItem?: Conversation) => {
      if (status !== 'authenticated') {
        unauthorizationToLogin();
        return;
      }
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
      const selected = selectedItem ?? botSelectedConversation;
      if (selected) {
        let updatedConversation: Conversation;
        let newMessage = [...chatToBotConverter(selected.messages), message];
        updatedConversation = {
          ...selected,
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
        // 更新发送token的算力消耗
        requestUpdateUserAccount(signedIn?.id, { tokenCount: sentTokenCount }).then((res: any) => {
          if (!res.success) {
            setTyping(false);
            let toastMsg = res.statusText;
            if (res.status === 403) toastMsg = '剩余算力不够，请充值';
            messageComp.error(toastMsg);
          }
        });

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
          user: selected.role ?? defaultRole,
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
      status,
    ],
  );

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null, selectedItem?: Conversation, options?: {}) => {
      if (status !== 'authenticated') {
        unauthorizationToLogin();
        return;
      }
      const selected = selectedItem ?? selectedConversation;
      if (selected) {
        let updatedConversation: Conversation;
        let newMessage = [...selected.messages, message];
        if (deleteCount) {
          const updatedMessages: Message[] = [...selected.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          newMessage = [...updatedMessages, message];
        }
        updatedConversation = {
          ...selected,
          messages: newMessage,
        };
        setSelectedConversation(updatedConversation);
        homeDispatch({ field: 'loading', value: true });
        setMessageIsStreaming(true);

        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: messageMapUtil(updatedConversation.messages),
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          userId: signedIn?.id || '',
          balance,
          options,
        };
        const endpoint = getEndpoint(plugin);

        let body = JSON.stringify(chatBody);;
        const controller = new AbortController();
        const { tokenCount: sentTokenCount } = await calTokenLength(chatBody);
        const subBalance = Math.round(sentTokenCount / 10);
        const newBalance = (balance || 0) - subBalance;

        if (newBalance < 0) {
          homeDispatch({ field: 'loading', value: false });
          setMessageIsStreaming(false);
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
          homeDispatch({ field: 'loading', value: false });
          setMessageIsStreaming(false);
          let toastMsg = response.statusText;
          if (response.status === 403) toastMsg = '剩余算力不够，请充值';
          messageComp.error(toastMsg);
          return;
        }
        // 更新发送token的算力消耗
        requestUpdateUserAccount(signedIn?.id, { tokenCount: sentTokenCount }).then((res: any) => {
          if (!res.success) {
            homeDispatch({ field: 'loading', value: false });
            setMessageIsStreaming(false);
            let toastMsg = res.statusText;
            if (res.status === 403) toastMsg = '剩余算力不够，请充值';
            messageComp.error(toastMsg);
          }
        });

        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          setMessageIsStreaming(false);
          return;
        }
        // 扣除balance后请求一次最新user
        fetchUserInfoMethod(signedIn?.id);

        if (updatedConversation.messages.length === 1) {
          const { content } = message;
          const customName =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          updatedConversation = {
            ...updatedConversation,
            name: customName,
          };
        }
        homeDispatch({ field: 'loading', value: false });
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
            const updatedMessages: Message[] = [
              ...updatedConversation.messages,
              { role: 'assistant', content: chunkValue },
            ];
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
          } else {
            const updatedMessages: Message[] =
              updatedConversation.messages.map((message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
                  };
                }
                return message;
              });
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
          }
          setSelectedConversation(updatedConversation);
        }
        fetchUserInfoMethod(signedIn?.id);
        setMessageIsStreaming(false);
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
        await requestUpdateUserAccount(signedIn?.id, { tokenCount: responseTokenCount, isSend: false });

        // 文本安全 TODO 节流
        if (needContentContraints) {
          const { data: security } = await getContentSecurity({ text });
          if (!security) {
            updatedConversation.messages = updatedConversation.messages.slice(0, -1);
            setSelectedConversation(updatedConversation);
            messageComp.warning('生成内容文案审核不通过');
            return;
          }
        }
        saveConversation(updatedConversation);
        // 扣除balance后请求一次最新user
        const updatedConversations: Conversation[] = conversations.map(
          (conversation: any) => {
            if (conversation.id === selected.id) {
              return updatedConversation;
            }
            return conversation;
          },
        );
        if (updatedConversations.length === 0 || !!selectedItem) {
          console.log('111 updatedConversation: ', updatedConversation);
          updatedConversations.push(updatedConversation);
        }
        setConversations(updatedConversations);
        console.log('222 conversations: ', updatedConversations);
        saveConversations(updatedConversations);
        // Flowise
        // const data = await queryFlowise({ "question": message.content });

        // const updatedMessages: Message[] = [
        //   ...updatedConversation.messages,
        //   { role: 'assistant', content: data },
        // ];
      }
    }, [
    apiKey,
    conversations,
    pluginKeys,
    selectedConversation,
    stopConversationRef,
    signedIn,
    balance,
    status,
  ]
  );

  // const scrollToBottom = useCallback(() => {
  //   if (autoScrollEnabled) {
  //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     textareaRef.current?.focus();
  //   }
  // }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
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

  const showChatBotContainer = useMemo(() => isBotMode && !botMode && isMobile(), [isBotMode, botMode]);

  return (
    <div className="flex flex-1 overflow-auto">

      <CharacterAudioPlayer />
      <div className={`${showChatBotContainer ? styles.chatuiMobileContainer : ''} relative flex-1 overflow-hidden bg-white dark:bg-[#343541]`}>
        {showSettings && (
          <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
            <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
              <ModelSelect />
            </div>
          </div>
        )}
        {
          modelError && <ErrorMessageDiv error={modelError} />
        }
        <>
          {
            activeMenu === 'workspace' && <>
              <ChatTool handleSend={handleSend} handleBotSend={handleBotSend} models={models} chatContainerRef={chatContainerRef} handleScroll={handleScroll} />
            </>
          }
          {
            activeMenu === 'chat' && <ChatCommunication handleSend={handleSend} stopConversationRef={stopConversationRef} handleScroll={handleScroll} />
          }
          {
            activeMenu === 'setting' && <SettingDialog />
          }
          {
            isBotMode && <DynamicChatBot
              resetList={resetList}
              Bubble={Bubble}
              Chat={Chat}
              messages={messages}
              handleSend={handleBotSend}
              logicOnly={!isBotMode}
              botMode={botMode}
              stopConversationRef={stopConversationRef}
            />
          }
        </>
      </div>
    </div>
  );
});
Main.displayName = 'Main';



