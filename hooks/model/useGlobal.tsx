import { useState, useMemo } from 'react';
import useAuthService from '@/services/useAuthService';
import { MenuType } from '@/constants';
import { Conversation } from '@/types/chat';
import { FolderInterface } from '@/types/folder';
import { PluginKey } from '@/types/plugin';

const defaultAccount = {
  balance: 0,
}

export const useGlobal = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({});
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);
  const [user, setUser] = useState<any>({ account: defaultAccount });
  // 是否开启语音回复模式
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  // 语音模式的语音内容
  const [voiceMessage, setVoiceMessage] = useState<string>('');
  // 上传图片状态
  const [isUploading, setIsUploading] = useState(false);
  // 激活菜单项
  const [activeMenu, setActiveMenu] = useState<MenuType>(MenuType.chat);
  // 是否全局loading态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 语音输入是中文模式还是英文模式
  const [voiceLang, setVoiceLang] = useState<'en-US' | 'zh-CN'>('zh-CN');

  // chatbar配置
  const [searchTerm, setSearchTerm] = useState<string>
    ('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [showChatbar, setShowChatbar] = useState<boolean>(false);
  const [folders, setFolders] = useState<FolderInterface[]>([]);

  const [pluginKeys, setPluginKeys] = useState<PluginKey[]>([]);
  const [defaultModelId, setDefaultModelId] = useState<string>('');

  const { fetchUserInfo, updateUserAccount } = useAuthService();

  const fetchUserInfoMethod = async (id: string) => {
    if (!id) return;
    const res = await fetchUserInfo({ id });
    if (res.success && res.data) {
      setUser(res.data);
    }
  }

  const requestUpdateUserAccount = async (id: string, data: any) => {
    if (!id) return;
    const tokenCount = data.tokenCount;
    const subBalance = Math.round(tokenCount / 10);
    const res = await updateUserAccount({ id, data: { ...data, subBalance } });
    if (res.success && res.data) {
      setUser(res.data);
    }
    return res;
  }

  // 是bot聊天对话模式
  const isBotMode = useMemo(() => activeMenu === MenuType.robot, [activeMenu]);

  return {
    isBotMode,
    roleModalOpen,
    currentRole,
    user,
    messageIsStreaming,
    voiceModeOpen,
    voiceMessage,
    isUploading,
    activeMenu,
    isLoading,
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
    defaultModelId,
    voiceLang,
    setVoiceLang,
    setDefaultModelId,
    setIsLoading,
    setActiveMenu,
    setIsUploading,
    setVoiceMessage,
    setVoiceModeOpen,
    setMessageIsStreaming,
    setUser,
    setRoleModalOpen,
    setCurrentRole,
    fetchUserInfoMethod,
    requestUpdateUserAccount,
  };
};
