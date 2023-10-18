import useRoleService from '@/services/useRoleService';
import { useState } from 'react';

export const useRole = () => {
  const { fetchRoles, addRole } = useRoleService();
  const [roleList, setRoleList] = useState<any>([]);

  const callFetchRoleList = async () => {
    const result = await fetchRoles();
    if (result.success && result.data) {
      setRoleList((result.data as any).map((item: any, index: number) => ({
        id: item.id,

      })));
    }
  }

  const callAddRole = async (payload: { opType: any, op: string, user: string }) => {
    const result = await addRole(payload);
    return result;
  }

  return {
    roleList,
    callFetchRoleList,
    callAddRole,
  };
};
