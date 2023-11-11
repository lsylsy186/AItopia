import { useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { IResponse } from '@/types/response';
import { accessToken } from '@/constants';

export interface ISignUpRequestProps {
  email: string;
  name: string;
  password: string;
  code?: string;
  productLine: any;
}

const useAuthService = () => {
  const fetchService = useFetch();
  const signUp = useCallback(
    (params: ISignUpRequestProps, signal?: AbortSignal) => {
      const { email, name, password, code, productLine } = params;
      return fetchService.post<IResponse>(`/api/user`, {
        body: { email, name, password, code, productLine, verify: true },
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  const signUpWithoutVerify = useCallback(
    (params: ISignUpRequestProps, signal?: AbortSignal) => {
      const { email, name, password, productLine } = params;
      return fetchService.post<IResponse>(`/api/user`, {
        body: { email, name, password, productLine, verify: false },
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  const fetchUserInfo = useCallback(
    (params: { id: string }, signal?: AbortSignal) => {

      const { id } = params;
      return fetchService.get<IResponse>(`/api/user/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
        signal,
      });
    },
    [fetchService],
  );

  const updateUserAccount = useCallback(
    (params: { id: string, data: any }, signal?: AbortSignal) => {

      const { id, data } = params;
      return fetchService.post<IResponse>(`/api/user/${id}/account/updateBalance`, {
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
        signal,
      });
    },
    [fetchService],
  );


  const sendMailCode = useCallback(
    (params: { email: string }, signal?: AbortSignal) => {
      return fetchService.post<IResponse>('/api/auth/mailCode', {
        body: params,
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  const fetchUsers = useCallback(
    (params: { productLine: string }) => {
      return fetchService.get<IResponse>(`/api/users?productLine=${params?.productLine}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  const fetchOperations = useCallback(
    () => {
      return fetchService.get<IResponse>('/api/admin/operation', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  const addOperation = useCallback(
    (params: { opType: any, op: string, user: string }) => {
      return fetchService.post<IResponse>('/api/admin/operation', {
        body: params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  const removeAccount = useCallback(
    (params: {
      id: string, auth: any
    }) => {
      return fetchService.delete<IResponse>(`/api/user/${params?.id}`, {
        body: params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.token}`
        },
      });
    },
    [fetchService],
  );

  const modUser = useCallback((params: { id: string, data: any }, signal?: AbortSignal) => {
    const { id, data } = params;
    return fetchService.post<IResponse>(`/api/user/${id}/account/update`, {
      body: params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.token}`
      },
    });
  },
    [fetchService],
  );
  const modPwd = useCallback((params: any, signal?: AbortSignal) => {
    return fetchService.post<IResponse>(`/api/auth/updatePwd`, {
      body: params,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
    [fetchService],
  );

  return {
    signUp,
    fetchUserInfo,
    updateUserAccount,
    sendMailCode,
    fetchUsers,
    fetchOperations,
    addOperation,
    removeAccount,
    modUser,
    modPwd,
    signUpWithoutVerify,
  };
};

export default useAuthService;
