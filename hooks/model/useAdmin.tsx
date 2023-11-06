import useAuthService from '@/services/useAuthService';
import { useState } from 'react';


export const useAdmin = () => {
  const { fetchUsers, fetchOperations, addOperation, removeAccount, modUser } = useAuthService();
  const [users, setUsers] = useState<any>([]);
  const [operations, setOperations] = useState<any>([]);

  const callFetchUsers = async (productLine: string) => {
    const result = await fetchUsers({ productLine });
    if (result.success && result.data) {
      setUsers((result.data as any).map((item: any, index: number) => ({
        id: item.id,
        key: index,
        name: item.name,
        email: item.email,
        balance: item.account?.balance,
        role: item.role,
        productLine: item.productLine
      })));
    }
  }

  const callFetchOperations = async () => {
    const result = await fetchOperations();
    if (result.success && result.data) {
      setOperations((result.data as any).map((item: any, index: number) => ({
        id: item.id,
        opType: item.opType,
        op: item.op,
        createdAt: item.createdAt,
        user: item.user,
      })));
    }
  }

  const callAddOperation = async (payload: { opType: any, op: string, user: string }) => {
    const result = await addOperation(payload);
    return result;
  }

  const callRemoveAccount = async (payload: { id: string, auth: any }) => {
    const result = await removeAccount(payload);
    return result;
  }

  const callModUser = async (payload: { id: string, data: any }) => {
    const result = await modUser(payload);
    return result;
  }

  return {
    users,
    callFetchUsers,
    operations,
    callFetchOperations,
    callAddOperation,
    callRemoveAccount,
    callModUser,
  };
};
