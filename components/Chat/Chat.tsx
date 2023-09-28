import message from 'antd/lib/message';
import { useSession } from "next-auth/react";
import { useModel } from '@/hooks';
import useAuthService from '@/services/useAuthService';
import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
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
import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { ErrorMessageDiv } from './ErrorMessageDiv';
import SigninButton from '../Buttons/SinginButton';
import useApiService from '@/services/useApiService';
import { calTokenLength } from '@/utils/tiktoken';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';

import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { IconAlien } from '@tabler/icons-react';
import { useRouter } from 'next/router';


// import { SystemPrompt } from './SystemPrompt';
// import { TemperatureSlider } from './Temperature';

const messageComp = message;

const RoleModal = dynamic(() => import('./RoleModal'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});
const RoleList = dynamic(() => import('./RoleList'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});
const ModelSelect = dynamic(() => import('./ModelSelect'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});
const MemoizedChatMessage = dynamic(() => import('./MemoizedChatMessage'), {
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

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      pluginKeys,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);
  const { status, data: session } = useSession();
  const { fetchUserInfoMethod, user, requestUpdateUserAccount } = useModel('global');
  const { getContentSecurity } = useApiService();
  const signedIn = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';
  const balance = user?.account?.balance || 0;

  const meta = getMeta(window.location.href || '');
  const { title, env } = meta;

  // 显示快捷工具标题
  const showShortcutTool = env === ENVS.normal;
  // 需要做文案审核
  const needContentContraints = env === ENVS.normal || env === ENVS.hebao;

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

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        let newMessage = [...selectedConversation.messages, message];
        if (deleteCount) {
          const updatedMessages: Message[] = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          newMessage = [...updatedMessages, message];
        }
        updatedConversation = {
          ...selectedConversation,
          messages: newMessage,
        };
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });

        const chatBody: ChatBody = {
          model: updatedConversation.model,
          messages: messageMapUtil(updatedConversation.messages),
          key: apiKey,
          prompt: updatedConversation.prompt,
          temperature: updatedConversation.temperature,
          userId: signedIn?.id || '',
          balance,
        };
        const endpoint = getEndpoint(plugin);

        let body;
        if (!plugin) {
          body = JSON.stringify(chatBody);
        } else {
          body = JSON.stringify({
            ...chatBody,
            googleAPIKey: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_API_KEY')?.value,
            googleCSEId: pluginKeys
              .find((key) => key.pluginId === 'google-search')
              ?.requiredKeys.find((key) => key.key === 'GOOGLE_CSE_ID')?.value,
          });
        }
        const controller = new AbortController();

        const { tokenCount: sentTokenCount } = await calTokenLength(chatBody);
        const subBalance = Math.round(sentTokenCount / 10);
        const newBalance = (balance || 0) - subBalance;

        if (newBalance < 0) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error('剩余算力不够，请充值');
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
          homeDispatch({ field: 'messageIsStreaming', value: false });
          let toastMsg = response.statusText;
          if (response.status === 403) toastMsg = '剩余算力不够，请充值';
          toast.error(toastMsg);
          return;
        }
        // 更新发送token的算力消耗
        const res = await requestUpdateUserAccount(signedIn?.id, { tokenCount: sentTokenCount });
        if (!res.success) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          let toastMsg = res.statusText;
          if (res.status === 403) toastMsg = '剩余算力不够，请充值';
          toast.error(toastMsg);
        }

        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        }
        // 扣除balance后请求一次最新user
        fetchUserInfoMethod(signedIn?.id);
        const handleWithoutPlugin = async () => {
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
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          }
          fetchUserInfoMethod(signedIn?.id);
          homeDispatch({ field: 'messageIsStreaming', value: false });

          // 更新回复token的算力消耗
          const { tokenCount: responseTokenCount } = await calTokenLength({ ...chatBody, messages: [{ content: text, role: 'assistant' }] }, false);
          await requestUpdateUserAccount(signedIn?.id, { tokenCount: responseTokenCount, isSend: false });

          // 文本安全 TODO 节流
          if (needContentContraints) {
            const { data: security } = await getContentSecurity({ text });
            if (!security) {
              updatedConversation.messages = updatedConversation.messages.slice(0, -1);
              homeDispatch({
                field: 'selectedConversation',
                value: updatedConversation,
              });
              messageComp.warning('生成内容文案审核不通过');
              return;
            }
          }
          saveConversation(updatedConversation);
          // 扣除balance后请求一次最新user

          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
        }
        const handleWithPlugin = async () => {
          // Flowise
          // const data = await queryFlowise({ "question": message.content });

          // const updatedMessages: Message[] = [
          //   ...updatedConversation.messages,
          //   { role: 'assistant', content: data },
          // ];
          const { answer } = await response.json();
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: answer },
          ];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updateConversation,
          });
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }

        if (!plugin) {
          await handleWithoutPlugin();
        } else {
          await handleWithPlugin();
        }
      }
    },
    [
      apiKey,
      conversations,
      pluginKeys,
      selectedConversation,
      stopConversationRef,
      signedIn,
      balance,
    ],
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

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
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

  const onRoleSelect = useCallback((prompt: string) => {
    console.log('status', status);
    if (status !== 'authenticated') {
      messageComp.warning('请登录后再发送信息');
      return;
    }
    handleSend({ role: 'user', content: prompt, hide: true }, 0, null);
  }, [status, handleSend]);

  const router = useRouter();
  const BalanceComp = () => {
    return <>
      <span>剩余算力：<span className={`text-sm ${balance <= 0 ? 'text-red-600' : ''}`}>{balance}</span></span>
    </>
  }

  // 支持联系方式
  const ableContact = env === ENVS.normal || ENVS.local;

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      <RoleModal onSelect={onRoleSelect} />
      {!(apiKey || serverSideApiKeyIsSet) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
            Welcome to {title}
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError} />
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages.length === 0 ? (
              <>
                <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  <SigninButton />
                </div>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[800px]">
                  <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    {models.length === 0 ? (
                      <div>
                        <Spinner size="16px" className="mx-auto" />
                      </div>
                    ) : (
                      title
                    )}
                  </div>

                  {models.length > 0 && (<>
                    {/* <div className="flex h-full flex-col space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-600">
                      <ModelSelect />
                      <SystemPrompt
                        conversation={selectedConversation}
                        prompts={prompts}
                        onChangePrompt={(prompt) =>
                          handleUpdateConversation(selectedConversation, {
                            key: 'prompt',
                            value: prompt,
                          })
                        }
                      />

                      <TemperatureSlider
                          label={t('Temperature')}
                          onChangeTemperature={(temperature) =>
                          handleUpdateConversation(selectedConversation, {
                              key: 'temperature',
                              value: temperature,
                          })
                          }
                      />
                    </div> */}
                    {
                      showShortcutTool
                        ? <div className='text-lg font-semibold text-stone-700'>快捷工具: </div>
                        : <></>
                    }
                    <RoleList onSelect={onRoleSelect} />
                  </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
                  {/* {t('Model')}: {selectedConversation?.model.name} | {t('Temp')}
                  : {selectedConversation?.temperature} |
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={handleSettings}
                  >
                    <IconSettings size={18} />
                  </button>
                  <button
                    className="ml-2 cursor-pointer hover:opacity-50"
                    onClick={onClearAll}
                  >
                    <IconClearAll size={18} />
                  </button> */}
                  <button
                    className="cursor-pointer select-none gap-3 rounded-md px-3 text-[14px] leading-3 transition-colors duration-200 hover:bg-gray-500/10"
                    onClick={() => {
                      if (!ableContact) return;
                      router.push('/other/contact')
                    }}
                  >
                    <span>{BalanceComp()}</span>
                  </button>
                  <SigninButton />
                </div>
                {showSettings && (
                  <div className="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
                    <div className="flex h-full flex-col space-y-4 border-b border-neutral-200 p-4 dark:border-neutral-600 md:rounded-lg md:border">
                      <ModelSelect />
                    </div>
                  </div>
                )}

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
              </>
            )}
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
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
