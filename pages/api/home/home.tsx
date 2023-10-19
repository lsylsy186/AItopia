import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useModel } from '@/hooks';
import { ChatTopBar } from '@/components/Chat/ChatTopBar';
import { useCreateReducer } from '@/hooks/useCreateReducer';
import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';
import { MenuType } from '@/constants';
import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  saveConversation as saveChatConversation,
  saveConversations as saveChatConversations,
  updateConversation as updateChatConversation,
  saveBotConversation,
  saveBotConversations,
  updateBotConversation,
} from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';
import { Main } from '@/components/Chat/Main';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import { Menu } from '@/components/Layout';
import { useRouter } from 'next/router'
// import Promptbar from '@/components/Promptbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState, IHandleNewConversationPayload } from './home.state';

import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);
  const { setShowChatbar, folders, setFolders, pluginKeys, setPluginKeys, setDefaultModelId, isBotMode, setActiveMenu } = useModel('global');
  const {
    selectedConversation: chatSelectedConversation,
    setSelectedConversation: setChatSelectedConversation,
    setConversations: setChatConversations,
    conversations: chatConversations
  } = useModel('chat');
  const { botSelectedConversation, callSetInitedBotConver, setBotConversations, botConversations } = useModel('bot');

  const router = useRouter()
  // isChatMode: 仅聊天对话模式
  const { botMode } = router.query

  useEffect(() => {
    if (botMode) setActiveMenu(MenuType.robot);
  }, [botMode]);

  const setSelectedConversation = useMemo(
    () => (isBotMode ? callSetInitedBotConver : setChatSelectedConversation),
    [isBotMode]
  );
  const setConversations = useMemo(
    () => (isBotMode ? setBotConversations : setChatConversations),
    [isBotMode]
  );
  const conversations = useMemo(
    () => (isBotMode ? botConversations : chatConversations),
    [isBotMode, botConversations, chatConversations]
  );
  const selectedConversation = useMemo(
    () => (isBotMode ? botSelectedConversation : chatSelectedConversation),
    [isBotMode, botSelectedConversation, chatSelectedConversation]
  );
  const saveConversations = useMemo(() => (isBotMode ? saveBotConversations : saveChatConversations), [isBotMode]);
  const updateConversation = useMemo(() => (isBotMode ? updateBotConversation : updateChatConversation), [isBotMode]);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false, staleTime: 120000 },
  );

  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data });
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({ field: 'modelError', value: getModelsError(error) });
  }, [dispatch, error, getModelsError]);

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f: any) => f.id !== folderId);
    setFolders(updatedFolders);
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c: any) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f: any) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    setFolders(updatedFolders);

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = (payload?: IHandleNewConversationPayload) => {
    const { isbot: isPayloadBot, prompt, source, assistant, text, temperature } = payload || {};
    let lastConversation = conversations[conversations.length - 1];
    let initMessages: any = [];
    const isbot = isPayloadBot === undefined ? isBotMode : isPayloadBot;

    if (isbot) {
      lastConversation = botConversations[botConversations.length - 1];
      if (source === 'workspace') {
        initMessages = [{
          role: 'user',
          content: { text: text ?? '' } as any,
          hide: true,
        }];
      }
    }
    const newTemperature = temperature ?? lastConversation?.temperature;
    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: initMessages,
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: prompt ?? DEFAULT_SYSTEM_PROMPT,
      temperature: newTemperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
      source: !!source ? source : 'new',
      assistant,
    };

    let updatedConversations = [...conversations, newConversation];
    if (isbot) {
      updatedConversations = [...botConversations, newConversation];
      callSetInitedBotConver(newConversation);
      setBotConversations(updatedConversations);
      saveBotConversation(newConversation);
      saveBotConversations(updatedConversations);
    } else {
      setChatSelectedConversation(newConversation);
      setChatConversations(updatedConversations);
      saveChatConversation(newConversation);
      saveChatConversations(updatedConversations);
    }

    dispatch({ field: 'loading', value: false });

    return newConversation;
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    setSelectedConversation(single);
    setConversations(all);
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      setShowChatbar(false);
    }
  }, [selectedConversation]);

  // 初始化conversations  --------------------------------------------
  useEffect(() => {
    // 获取chat聊天历史记录
    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      setChatConversations(cleanedConversationHistory);
    }
    // 获取chat聊天所选聊天记录
    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      setChatSelectedConversation(cleanedSelectedConversation);
    } else {
      const lastConversation = chatConversations[chatConversations.length - 1];
      setChatSelectedConversation({
        id: uuidv4(),
        name: t('New Conversation'),
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
        folderId: null,
      });
    }

    // 获取bot聊天历史记录
    const botConversationHistory = localStorage.getItem('botConversationHistory');
    if (botConversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(botConversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      setBotConversations(cleanedConversationHistory);
    }
    // 获取bot聊天所选聊天记录
    const botSelectedConversation = localStorage.getItem('botSelectedConversation');
    if (botSelectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(botSelectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );
      callSetInitedBotConver(cleanedSelectedConversation);
    } else {
      const lastConversation = botConversations[botConversations.length - 1];
      callSetInitedBotConver({
        id: uuidv4(),
        name: t('New Conversation'),
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
        folderId: null,
      });
    }
  }, [defaultModelId]);

  useEffect(() => {
    defaultModelId && setDefaultModelId(defaultModelId);
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      setPluginKeys([]);
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      setPluginKeys(pluginKeys);
    }

    if (window.innerWidth < 640) {
      setShowChatbar(false);
      dispatch({ field: 'showPromptbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      setShowChatbar(showChatbar === 'true');
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      setFolders(JSON.parse(folders));
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>Chatbot</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            {!botMode && <Menu />}
            <Chatbar />
            <div className="flex h-full w-full flex-col overflow-auto">
              <ChatTopBar />
              <Main stopConversationRef={stopConversationRef} />
            </div>
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
