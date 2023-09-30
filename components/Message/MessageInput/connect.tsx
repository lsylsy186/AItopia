import { useCallback, useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useModel } from '@/hooks';
// import { isIP } from 'is-ip';

export const getHostName = () => {
  if (process.env.REACT_APP_API_HOST) {
    return process.env.REACT_APP_API_HOST;
  }
  let currentHost = window.location.host;
  let parts = currentHost.split(':');
  let hostname = parts[0];
  // Local deployment uses 8000 port by default.
  let newPort = 8000;
  if (process.env.REACT_APP_ENABLE_MULTION) {
    // TODO: Multion doesn't allow custom port yet. Remove this once it's supported.
    newPort = 8001;
  }

  // if (!(hostname === 'localhost' || isIP(hostname))) {
  if (!(hostname === 'localhost')) {
    // Remove www. from hostname
    hostname = hostname.replace('www.', '');
    hostname = 'api.' + hostname;
    newPort = window.location.protocol === 'https:' ? 443 : 80;
  }
  let newHost = hostname + ':' + newPort;
  return newHost;
};

const defaultAccount = {
  balance: 0,
}

export const languageCode = {
  English: 'en-US',
  Chinese: 'zh-CN',
  French: 'fr-FR',
  German: 'de-DE',
  Italian: 'it-IT',
  Japanese: 'ja-JP',
  Korean: 'ko-KR',
  Portuguese: 'pt-PT',
  Russian: 'ru-RU',
  Spanish: 'es-ES',
  Hindi: 'hi-IN',
  Polish: 'pl-PL',
};

export const Connect = (props: any) => {
  const {
    isConnected,
    connectMicrophone,
    socketRef,
    mediaRecorder,
    setIsRecording,
    callActive,
    send,
    audioSent,
    stopRecording,
    audioPlayer,
    connectPeer,
    setContent,
    content,
    messageIsStreaming
  } = props;

  const [sessionId, setSessionId] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<keyof typeof languageCode>('English');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo-16k');
  const [useSearch, setUseSearch] = useState(false);
  const [useQuivr, setUseQuivr] = useState(false);
  const [useMultiOn, setUseMultiOn] = useState(false);
  const [useEchoCancellation, setUseEchoCancellation] = useState(false);
  const [token, setToken] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isCallView, setIsCallView] = useState(false);
  const recognition = useRef<any>(null);
  const onresultTimeout = useRef<any>(null);
  const onspeechTimeout = useRef<any>(null);
  const finalTranscripts = useRef<any>([]);
  const shouldPlayAudio = useRef<any>(false);
  const audioQueue = useRef<any>([]);
  const isConnecting = useRef<any>(false);
  const confidence = useRef<any>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [messageId, setMessageId] = useState('');

  const { setMessageIsStreaming } = useModel('global');

  const stopAudioPlayback = () => {
    if (audioPlayer.current) {
      audioPlayer.current.pause();
      shouldPlayAudio.current = false;
    }
    audioQueue.current = [];
    setIsPlaying(false);
  };

  // initialize speech recognition
  const initializeSpeechRecognition = () => {
    (window as any).SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition.current = new (window as any).SpeechRecognition();
    recognition.current.interimResults = true;
    recognition.current.maxAlternatives = 1;
    recognition.current.continuous = true;

    let language = languageCode[preferredLanguage];
    recognition.current.lang = language;

    recognition.current.onend = () => {
      if (callActive.current) {
        startListening();
      }
    };

    recognition.current.onresult = (event: any) => {
      // Clear the timeout if a result is received
      clearTimeout(onresultTimeout.current);
      clearTimeout(onspeechTimeout.current);
      stopAudioPlayback();
      const result = event.results[event.results.length - 1];
      const transcriptObj = result[0];
      const transcript = transcriptObj.transcript;
      const ifFinal = result.isFinal;
      if (ifFinal) {
        console.log(`final transcript: {${transcript}}`);
        finalTranscripts.current.push(transcript);
        confidence.current = transcriptObj.confidence;
        send(`[&]${transcript}`);
      } else {
        console.log(`interim transcript: {${transcript}}`);
      }
      // Set a new timeout
      onresultTimeout.current = setTimeout(() => {
        if (ifFinal) {
          return;
        }
        // If the timeout is reached, send the interim transcript
        console.log(`TIMEOUT: interim transcript: {${transcript}}`);
        send(`[&]${transcript}`);
      }, 500); // 500 ms

      onspeechTimeout.current = setTimeout(() => {
        stopListening();
      }, 2000); // 2 seconds
    };

    recognition.current.onspeechend = () => {
      if (isConnected.current) {
        if (confidence.current > 0.8 && finalTranscripts.current.length > 0) {
          let message = finalTranscripts.current.join(' ');
          send(message);
          setContent(content + `\nYou> ${message}\n`);
          shouldPlayAudio.current = true;
          audioSent.current = true;
        } else {
          audioSent.current = false;
        }
        stopRecording();
        startRecording();
      }
      finalTranscripts.current = [];
    };
  };

  const handleSocketOnMessage = (event: any) => {
    if (typeof event.data === 'string') {
      const message = event.data;
      if (!messageIsStreaming) setMessageIsStreaming(true);
      if (message === '[end]\n' || message.match(/\[end=([a-zA-Z0-9]+)\]/)) {
        setMessageIsStreaming(false);
        setIsResponding(false);
        setContent(content + '\n\n');
        const messageIdMatches = message.match(/\[end=([a-zA-Z0-9]+)\]/);
        if (messageIdMatches) {
          const messageId = messageIdMatches[1];
          setMessageId(messageId);
        }
      } else if (message === '[thinking]\n') {
        setIsThinking(true);
      } else if (message.startsWith('[+]You said: ')) {
        // [+] indicates the transcription is done. stop playing audio
        let msg = message.split('[+]You said: ');
        setContent(content + `\nYou> ${msg[1]}\n`);
        stopAudioPlayback();
      } else if (
        message.startsWith('[=]' || message.match(/\[=([a-zA-Z0-9]+)\]/))
      ) {
        // [=] or [=id] indicates the response is done
        setContent(content + '\n\n');
      } else {
        setIsThinking(false);
        setIsResponding(true);
        setContent(content + `${event.data}`);

        // if user interrupts the previous response, should be able to play audios of new response
        shouldPlayAudio.current = true;
      }
    } else {
      // binary data
      if (!shouldPlayAudio.current) {
        console.log('should not play audio');
        return;
      }
      audioQueue.current.push(event.data);
      if (audioQueue.current.length === 1) {
        setIsPlaying(true); // this will trigger playAudios in CallView.
      }
    }
  };

  // Helper functions
  const handleSocketOnOpen = async (event: any) => {
    console.log('successfully connected');
    isConnected.current = true;
    await connectMicrophone(selectedDevice);
    if (!useEchoCancellation) {
      initializeSpeechRecognition();
    }
    await connectPeer(selectedDevice);
  };


  // initialize web socket and connect to server.
  const connectSocket = useCallback(() => {
    if (!socketRef.current) {
      if (!selectedCharacter) {
        return;
      }
      const sessionId = uuidv4().replace(/-/g, '');
      setSessionId(sessionId);
      const ws_scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      // Get the current host value
      // Generate the new host value with the same IP but different port
      let newHost = getHostName();

      let language = languageCode[preferredLanguage];

      const ws_path =
        ws_scheme +
        '://' +
        newHost +
        `/ws/${sessionId}?llm_model=${selectedModel}&platform=web&use_search=${useSearch}&use_quivr=${useQuivr}&use_multion=${useMultiOn}&character_id=${(selectedCharacter as any).character_id}&language=${language}&token=${token}`;
      (socketRef as any).current = new WebSocket(ws_path);
      let socket: any = socketRef.current;
      socket.binaryType = 'arraybuffer';
      socket.onopen = handleSocketOnOpen;
      socket.onmessage = handleSocketOnMessage;
      socket.onerror = (error: any) => {
        console.log(`WebSocket Error: ${error}`);
      };
      socket.onclose = (event: any) => {
        console.log('Socket closed');
      };
    }
  }, [
    token,
    handleSocketOnOpen,
    handleSocketOnMessage,
    selectedModel,
    preferredLanguage,
    useSearch,
    useQuivr,
    selectedCharacter,
    setSessionId,
  ]);

  const startListening = () => {
    if (!recognition.current) return;
    console.log('start listening');
    recognition.current.start();
  };

  const stopListening = () => {
    if (!recognition.current) return;
    console.log('stop listening');
    recognition.current.stop();
  };

  const closeRecognition = () => {
    stopListening();
    recognition.current = null;
    confidence.current = 0;
  };

  const startRecording = () => {
    console.log('start recording');
    if (!mediaRecorder.current) return;
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  return {
    connectSocket,
    startListening,
    stopListening,
    closeRecognition,
    startRecording,
  }
}