import { useState, useRef, useCallback } from 'react';

export const useMedia = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<any>(null);
  const chunks = useRef<any>([]);
  const callActive = useRef<any>(false);
  const harkInitialized = useRef<any>(false);
  const audioSent = useRef<any>(false);
  const isConnected = useRef<any>(false);
  const socketRef = useRef<any>(null);
  const pcRef = useRef<any>(null);
  const otherPCRef = useRef<any>(null);
  const audioPlayer = useRef<any>(null);
  const micStreamRef = useRef<any>(null);
  const incomingStreamDestinationRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);

  const handleOnTrack = (event: any) => {
    if (event.streams && event.streams[0]) {
      audioPlayer.current.srcObject = event.streams[0];
    }
  };

  const connectPeer = useCallback(async (deviceId: string) => {
    if (!pcRef.current) {
      pcRef.current = new RTCPeerConnection({
        sdpSemantics: 'unified-plan',
      } as any);
      // Setup local webrtc connection just for echo cancellation.
      otherPCRef.current = new RTCPeerConnection({
        sdpSemantics: 'unified-plan',
      } as any);
      pcRef.current.onicecandidate = (e: any) =>
        e.candidate &&
        otherPCRef.current.addIceCandidate(new RTCIceCandidate(e.candidate));
      otherPCRef.current.onicecandidate = (e: any) =>
        e.candidate &&
        pcRef.current.addIceCandidate(new RTCIceCandidate(e.candidate));
      pcRef.current.ontrack = handleOnTrack;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      micStreamRef.current = stream;
      await stream.getTracks().forEach(function (track) {
        pcRef.current.addTrack(track, stream);
      });
      // Maintain a single audio stream for the duration of the call.
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      incomingStreamDestinationRef.current =
        audioContextRef.current.createMediaStreamDestination();
      incomingStreamDestinationRef.current.stream
        .getTracks()
        .forEach(function (track: any) {
          otherPCRef.current.addTrack(
            track,
            incomingStreamDestinationRef.current.stream
          );
        });
      // Negotiation between two local peers.
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      await otherPCRef.current.setRemoteDescription(offer);
      const answer = await otherPCRef.current.createAnswer();
      await otherPCRef.current.setLocalDescription(answer);
      await pcRef.current.setRemoteDescription(answer);

      return new Promise(resolve => {
        pcRef.current.oniceconnectionstatechange = (e: any) => {
          if (pcRef.current.iceConnectionState === 'connected') {
            resolve('');
          }
        };
      });
    }
  }, []);


  const closePeer = () => {
    pcRef.current.close();
    pcRef.current = null;
    otherPCRef.current.close();
    otherPCRef.current = null;
  };

  // send message to server
  const send = useCallback(
    (data: any) => {
      console.log('message sent to server');
      if (
        socketRef.current &&
        (socketRef.current as any)?.readyState === WebSocket.OPEN
      ) {
        (socketRef.current as any)?.send(data);
      }
    },
    [socketRef]
  );

  const closeSocket = useCallback(() => {
    (socketRef.current as any)?.close();
    socketRef.current = null;
  }, [socketRef]);

  // initialize media recorder
  const connectMicrophone = (deviceId: string) => {
    if (mediaRecorder.current) return;
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
        },
      })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.ondataavailable = (event: any) => {
          chunks.current.push(event.data);
        };
        mediaRecorder.current.onstop = () => {
          let blob = new Blob(chunks.current, { type: 'audio/webm' });
          chunks.current = [];

          // TODO: debug download video

          if (isConnected.current) {
            if (!audioSent.current) {
              send(blob);
            }
            audioSent.current = false;
            if (callActive.current) {
              setIsRecording(true);
            }
          }
        };
      })
      .catch(function (err) {
        console.log('An error occurred: ' + err);
        if (err.name === 'NotAllowedError') {
          alert(
            'Permission Denied: Please grant permission to access the microphone and refresh the website to try again!'
          );
        } else if (err.name === 'NotFoundError') {
          alert(
            'No Device Found: Please check your microphone device and refresh the website to try again.'
          );
        }
        isConnected.current = false;
        closeMediaRecorder();
        closeSocket();
      });
  };


  const stopRecording = () => {
    console.log('stop recording');
    if (!mediaRecorder.current) return;
    mediaRecorder.current.stop();
    setIsRecording(false);
  };

  const closeMediaRecorder = () => {
    stopRecording();
    mediaRecorder.current = null;
    chunks.current = [];
  };

  return {
    connectPeer,
    isRecording,
    setIsRecording,
    connectMicrophone,
    stopRecording,
    closeMediaRecorder,
    send,
    closeSocket
  };
};
