import { useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { IResponse } from '@/types/response';

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
          // authorization: 
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    signUp,
    fetchUserInfo
  };
};

export default useAuthService;
