import { useCallback } from 'react';
import { IResponse } from '@/types/response';
import { useFetch } from '@/hooks/useFetch';


const useElevenlabsService = () => {
  const fetchService = useFetch();

  const getVoices = useCallback(
    () => {
      return fetchService.get<IResponse>(`/api/speech/voice`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    [fetchService],
  );

  const getModels = useCallback(
    () => {
      return fetchService.get<IResponse>(`/api/speech/models`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    [fetchService],
  );

  const postTextToSpeech = useCallback(
    (params: { voiceId: string, modelId?: string }, signal?: AbortSignal) => {
      return fetchService.post<IResponse>(`/api/texttospeech`, {
        body: params,
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    getVoices,
    getModels,
    postTextToSpeech,
  };
};

export default useElevenlabsService;
