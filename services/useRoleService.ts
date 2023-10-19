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
    (params: {
      img: string;
      productLine: string[],
      title: string,
      description: string,
      prompt: string,
      example: string,
      api: string,
      mode: string,
      systemPrompt: string,
      assistant: any,
      cost: string,
      roleOptions: any
    }) => {
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
  const modRole = useCallback(
    (params: {
      id: string,
      img: string,
      productLine: string[],
      title: string,
      description: string,
      prompt: string,
      example: string,
      cost: number,
      systemPrompt: string,
    }) => {
      return fetchService.post<IResponse>('/api/role/update', {
        body: params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );
  const removeRole = useCallback(
    (params: {
      id: string,
    }) => {
      return fetchService.delete<IResponse>('/api/role', {
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
    modRole,
    removeRole
  };
};

export default useRoleService;
