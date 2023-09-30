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
    setMessageIsStreaming,
    setUser,
    setRoleModalOpen,
    setCurrentRole,
    fetchUserInfoMethod,
    requestUpdateUserAccount,
  };
};
