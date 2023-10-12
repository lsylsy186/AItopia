import useAuthService from '@/services/useAuthService';
import { useState } from 'react';


export const useAdmin = () => {
  const { fetchUsers } = useAuthService();
  const [users, setUsers] = useState<any>([]);

  const callFetchUsers = async (productLine: string) => {
    const result = await fetchUsers({ productLine });
    if (result.success && result.data) {
      setUsers((result.data as any).map((item: any, index: number) => ({
        key: index,
        name: item.name,
        email: item.email,
        balance: item.account?.balance,
        role: item.role,
        productLine: item.productLine
      })));
    }
  }

  return {
    users,
    callFetchUsers,
  };
};
