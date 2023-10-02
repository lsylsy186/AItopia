import React, { useEffect, useState } from "react";
import { useModel } from '@/hooks';
import message from 'antd/lib/message';
import {
  IconVolume,
  IconVolumeOff
} from '@tabler/icons-react';
import { isMobile } from '@/utils/app';
import styles from './styles.module.css'

async function playText(payload: { text: string, modelId: string, voiceId: string }, setIsPlaying: (isPlaying: boolean) => void) {
  const response = await fetch('/api/speech/texttospeech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    // throw new Error("Speech generation failed");
    return;
  }

  const audioContext = new window.AudioContext();
  const audioData = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(audioData);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();

  source.onended = () => {
    audioContext.close();
  }
}

export function CharacterAudioPlayer() {
  const { voiceModeOpen, setVoiceModeOpen, voiceMessage, setVoiceMessage } = useModel('global');
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const {
    defaultModel,
    defaultVoice,
    fetchElevenlabsModels,
    fetchVoices,
    voices,
    models,
    requestTextToSpeech
  } = useModel('elevenlabs');
  useEffect(() => {
    if (voiceModeOpen && !voices.length) fetchVoices();
  }, [voiceModeOpen, voices]);

  useEffect(() => {
    if (voiceModeOpen && !models.length) fetchElevenlabsModels();
  }, [voiceModeOpen, models]);

  // const togglePlay = () => {
  //   if (isPlaying) {
  //     setIsPlaying(false)
  //   } else {
  //     setIsPlaying(true)
  //     if (voiceMessage !== null) {
  //       playText({ text: voiceMessage, modelId: defaultModel.model_id, voiceId: defaultVoice.voice_id }, setIsPlaying)
  //     }
  //   }
  // }

  const maxPlay = 2
  const [plays, setPlays] = useState<number>(0)

  useEffect(() => {
    if (!voiceModeOpen || plays >= maxPlay || !voiceMessage) {
      return;
    }
    playText({ text: voiceMessage, modelId: defaultModel.model_id, voiceId: defaultVoice.voice_id }, setIsPlaying);
  }, [voiceModeOpen, voiceMessage, setIsPlaying])

  const toggleOpen = () => {
    setVoiceModeOpen(!voiceModeOpen);
    setVoiceMessage('');
    message.info(`${voiceModeOpen ? '语音回复功能已关闭' : '语音回复功能已开启'}`);
  }

  if (!isMobile()) return <></>;

  return <div className={styles.voiceSwitch} onClick={toggleOpen}>
    <span className="flex justify-center text-center flex-col">
      {voiceModeOpen ? <IconVolumeOff size={25} /> : <IconVolume size={25} />}
    </span>
  </div>
}
