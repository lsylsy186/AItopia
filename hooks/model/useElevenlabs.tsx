import { useState, useMemo } from 'react';
import useElevenlabsService from '@/services/useElevenlabsService';

const defaultModelId = "eleven_multilingual_v2";
const defaultVoiceId = "v3";

export const useElevenlabs = () => {
  const [voices, setVoices] = useState([]);
  const [models, setModels] = useState([]);

  const defaultModel = useMemo(() => {
    if (!models.length) return {};
    const bestChoice = models.filter((model: any) => model.model_id === defaultModelId);
    return bestChoice?.[0] || models[0];
  }, [models]);

  const defaultVoice = useMemo(() => {
    if (!voices.length) return {};
    const bestChoice = voices.filter((voice: any) => voice.name === defaultVoiceId);
    return bestChoice?.[0] || voices[0];
  }, [voices]);

  const { getModels, getVoices, postTextToSpeech } = useElevenlabsService();

  const fetchElevenlabsModels = async () => {
    const res = await getModels();
    console.log('models res', res);
    if (res.success && res.data) {
      setModels(res.data as any);
    }
  }

  const fetchVoices = async () => {
    const res = await getVoices();
    if (res.success && res.data) {
      setVoices((res?.data as any)?.voices as any);
    }
  }

  const requestTextToSpeech = async (data: any) => {
    const res = await postTextToSpeech(data);
    if (res.success && res.data) {
      return res.data;
    }
    console.error(res);
  }

  return {
    defaultModel,
    defaultVoice,
    voices,
    models,
    fetchElevenlabsModels,
    fetchVoices,
    requestTextToSpeech,
  };
};
