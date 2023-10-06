import { useState } from 'react';
import useAuthService from '@/services/useAuthService';

const defaultAccount = {
  balance: 0,
}

export const useGlobal = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({});
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);
  const [user, setUser] = useState<any>({ account: defaultAccount });
  // 是否开启语音模式
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  // 语音模式的语音内容
  const [voiceMessage, setVoiceMessage] = useState<string>('');
  // 上传图片状态
  const [isUploading, setIsUploading] = useState(false);
  // 激活菜单项
  const [activeMenu, setActiveMenu] = useState<string>('chat');

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

  return {
    roleModalOpen,
    currentRole,
    user,
    messageIsStreaming,
    voiceModeOpen,
    voiceMessage,
    isUploading,
    activeMenu,
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
