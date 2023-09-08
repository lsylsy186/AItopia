import { useState } from 'react';
import useAuthService from '@/services/useAuthService';

const defaultAccount = {
  balance: 0,
}

export const useGlobal = () => {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({});
  const [user, setUser] = useState<any>({ account: defaultAccount });

  const { fetchUserInfo } = useAuthService();

  const fetchUserInfoMethod = async (id: string) => {
    if (!id) return;
    const res = await fetchUserInfo({ id });
    if (res.success && res.data) {
      setUser(res.data);
    }
  }

  return {
    roleModalOpen,
    currentRole,
    user,
    setUser,
    setRoleModalOpen,
    setCurrentRole,
    fetchUserInfoMethod,
  };
};
