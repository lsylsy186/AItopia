import { useCallback, useContext, useEffect, useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { saveConversation as saveChatConversation, saveConversations as saveChatConversations, saveBotConversation, saveBotConversations } from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { exportData, importData } from '@/utils/app/importExport';

import { Conversation } from '@/types/chat';
import { LatestExportFormat, SupportedExportFormats } from '@/types/export';
import { OpenAIModels, OpenAIModelID } from '@/types/openai';
import { PluginKey } from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';

import { ChatFolders } from './components/ChatFolders';
import { ChatbarSettings } from './components/ChatbarSettings';
import { Conversations } from './components/Conversations';

import Sidebar from '@/components/Sidebar';
import { useModel } from '@/hooks';
import ChatbarContext from './Chatbar.context';
import { v4 as uuidv4 } from 'uuid';

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const {
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);
  const { setSelectedConversation: setChatSelectedConversation, setConversations: setChatConversations, conversations: chatConversations } = useModel('chat');
  const { setBotConversations, botConversations, callSetInitedBotConver } = useModel('bot');

  const {
    searchTerm,
    setSearchTerm,
    filteredConversations,
    setFilteredConversations,
    showChatbar,
    setShowChatbar,
    folders,
    setFolders,
    pluginKeys,
    setPluginKeys,
    defaultModelId: tempDefaultModelId,
    setDefaultModelId,
    isBotMode,
  } = useModel('global');
  const conversations = useMemo(() => {
    return isBotMode ? botConversations : chatConversations;
  }, [isBotMode, botConversations, chatConversations]);
  const setConversations = useMemo(() => {
    return isBotMode ? setBotConversations : setChatConversations;
  }, [isBotMode]);
  const setSelectedConversation = useMemo(() => {
    return isBotMode ? callSetInitedBotConver : setChatSelectedConversation;
  }, [isBotMode]);
  const saveConversation = useMemo(() => {
    return isBotMode ? saveBotConversation : saveChatConversation;
  }, [isBotMode]);
  const saveConversations = useMemo(() => {
    return isBotMode ? saveBotConversations : saveChatConversations;
  }, [isBotMode]);

  const defaultModelId = tempDefaultModelId as OpenAIModelID;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey });

      localStorage.setItem('apiKey', apiKey);
    },
    [homeDispatch],
  );

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key: any) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key: any) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey;
        }

        return key;
      });

      setPluginKeys(updatedPluginKeys);

      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
    } else {
      setPluginKeys([...pluginKeys, pluginKey]);

      localStorage.setItem(
        'pluginKeys',
        JSON.stringify([...pluginKeys, pluginKey]),
      );
    }
  };

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter(
      (key: any) => key.pluginId !== pluginKey.pluginId,
    );

    if (updatedPluginKeys.length === 0) {
      setPluginKeys([]);
      localStorage.removeItem('pluginKeys');
      return;
    }

    setPluginKeys(updatedPluginKeys);

    localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);
    setConversations(history);
    setSelectedConversation(history[history.length - 1],);
    setFolders(folders);
    homeDispatch({ field: 'prompts', value: prompts });

    window.location.reload();
  };

  // 处理clear chat模式
  const handleClearConversations = () => {
    defaultModelId && setSelectedConversation({
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: OpenAIModels[defaultModelId],
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: DEFAULT_TEMPERATURE,
      folderId: null,
    });

    setConversations([]);

    if (isBotMode) {
      localStorage.removeItem('botConversationHistory');
      localStorage.removeItem('botSelectedConversation');
    } else {
      localStorage.removeItem('conversationHistory');
      localStorage.removeItem('selectedConversation');
    }
    const updatedFolders = folders.filter((f: any) => f.type !== 'chat');

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };


  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c: any) => c.id !== conversation.id,
    );

    setConversations(updatedConversations);
    setSearchTerm('');
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      setSelectedConversation(updatedConversations[updatedConversations.length - 1]);

      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      defaultModelId && setSelectedConversation({
        id: uuidv4(),
        name: t('New Conversation'),
        messages: [],
        model: OpenAIModels[defaultModelId],
        prompt: DEFAULT_SYSTEM_PROMPT,
        temperature: DEFAULT_TEMPERATURE,
        folderId: null,
      });
      if (isBotMode) {
        localStorage.removeItem('botSelectedConversation');
      } else {
        localStorage.removeItem('selectedConversation');
      }
    }
  };

  const handleToggleChatbar = () => {
    setShowChatbar(!showChatbar);
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });
      setSearchTerm('');
      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      setFilteredConversations(conversations.filter((conversation: any) => {
        const searchable =
          conversation.name.toLocaleLowerCase() +
          ' ' +
          conversation.messages.map((message: any) => message.content).join(' ');
        return searchable.toLowerCase().includes(searchTerm.toLowerCase());
      }))
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchTerm, conversations]);

  return (
    <ChatbarContext.Provider
      value={{
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Conversation>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Conversations conversations={filteredConversations} />}
        folderComponent={<ChatFolders searchTerm={searchTerm} />}
        items={filteredConversations}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          setSearchTerm(searchTerm)
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleCreateFolder={() => handleCreateFolder(t('New folder'), 'chat')}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
