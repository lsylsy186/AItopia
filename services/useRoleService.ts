import { useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { IResponse } from '@/types/response';
import { accessToken } from '@/constants';

const useRoleService = () => {
  const fetchService = useFetch();

  const fetchRoles = useCallback(
    () => {
      return fetchService.get<IResponse>('/api/role', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  const addRole = useCallback(
    (params: { opType: any, op: string, user: string }) => {
      return fetchService.post<IResponse>('/api/role', {
        body: params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  return {
    fetchRoles,
    addRole,
  };
};

export default useRoleService;
