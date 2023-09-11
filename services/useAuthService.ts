import { useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { IResponse } from '@/types/response';
import { accessToken } from '@/constants';

export interface ISignUpRequestProps {
  email: string;
  name: string;
  password: string;
}

const useAuthService = () => {
  const fetchService = useFetch();

  const signUp = useCallback(
    (params: ISignUpRequestProps, signal?: AbortSignal) => {
      const { email, name, password } = params;
      return fetchService.post<IResponse>(`/api/user`, {
        body: { email, name, password },
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

  return {
    signUp,
    fetchUserInfo,
    updateUserAccount
  };
};

export default useAuthService;
