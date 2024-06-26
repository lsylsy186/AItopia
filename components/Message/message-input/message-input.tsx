import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { MessagePayload } from "../types";
import {
  CurrentChannelAtom,
  TypingIndicatorTimeoutAtom,
  UsersMetaAtom,
  ErrorFunctionAtom,
} from "../state-atoms";

export interface CommonMessageInputProps {
  /** Option to set a placeholder message to display in the text window. */
  placeholder?: string;
  /** Option to set a draft message to display in the text window. */
  draftMessage?: string;
  /** Option to attach sender data directly to each message. Enable it for high-throughput environments.
   * This is an alternative to providing a full list of users directly into the Chat provider. */
  senderInfo?: boolean;
  /** Option to enable/disable firing the typing events when a user is typing a message. */
  typingIndicator?: boolean;
  /** Option to enable/disable the internal file upload capability. */
  fileUpload?: "image" | "all";
  /** Option to disable the input from composing and sending messages. */
  disabled?: boolean;
  /** Custom UI component to override default display for the Send button. */
  sendButton?: JSX.Element | string;
  /** Option to move action buttons (eg. file upload icon) to the right of the text input. */
  actionsAfterInput?: boolean;
  /** Callback to modify message content before sending it. This only works for text messages, not files. */
  onBeforeSend?: (value: MessagePayload) => MessagePayload;
  /** Callback for extra actions after sending a message. */
  onSend?: (value: MessagePayload | File | any) => void;
  /** Option to provide an extra actions renderer to add custom action buttons to the input. */
  extraActionsRenderer?: () => JSX.Element;
}

/**
 * Allows users to compose messages using text and emojis
 * and automatically publish them on PubNub channels upon sending.
 */
export const useMessageInputCore = (props: CommonMessageInputProps) => {
  const { draftMessage, senderInfo, onSend, onBeforeSend, typingIndicator } = props;

  const [text, setText] = useState(draftMessage || "");
  const [file, setFile] = useState<File | any>(null);
  const [typingIndicatorSent, setTypingIndicatorSent] = useState(false);
  const [loader, setLoader] = useState(false);
  const [users] = useAtom(UsersMetaAtom);
  const [channel] = useAtom(CurrentChannelAtom);
  const [onErrorObj] = useAtom(ErrorFunctionAtom);
  const onError = onErrorObj.function;
  const [typingIndicatorTimeout] = useAtom(TypingIndicatorTimeoutAtom);

  /*
  /* Helper functions
  */
  const isValidInputText = () => {
    return !!text.trim().length;
  };

  /*
  /* Commands
  */

  const sendMessage = async () => {
    if (loader) return;
    try {
      if (!file && !isValidInputText()) return;
      let message = {} as MessagePayload;
      // setLoader(true);

      // if (file) {
      //   await pubnub.sendFile({ channel, file, message });
      //   onSend && onSend(file);
      // } else if (text) {
      //   if (onBeforeSend) message = onBeforeSend(message) || message;
      //   await pubnub.publish({ channel, message });
      //   onSend && onSend(message);
      // }

      // if (typingIndicator) stopTypingIndicator();
      // clearInput();
    } catch (e) {
      onError(e as any);
    } finally {
      setLoader(false);
    }
  };

  const startTypingIndicator = async () => {
    if (typingIndicatorSent) return;
    try {
      setTypingIndicatorSent(true);
      const message = { message: { type: "typing_on" }, channel };
    } catch (e) {
      onError(e as any);
    }
  };

  const stopTypingIndicator = async () => {
    if (!typingIndicatorSent) return;
    try {
      setTypingIndicatorSent(false);
      const message = { message: { type: "typing_off" }, channel };
    } catch (e) {
      onError(e as any);
    }
  };

  const clearInput = () => {
    setFile(null);
    setText("");
  };

  /*
  /* Lifecycle
  */
  useEffect(() => {
    let timer: any = null;

    if (typingIndicatorSent) {
      timer = setTimeout(() => {
        setTypingIndicatorSent(false);
      }, (typingIndicatorTimeout - 1) * 1000);
    }

    return () => clearTimeout(timer);
  }, [typingIndicatorSent, typingIndicatorTimeout]);

  return {
    clearInput,
    file,
    setFile,
    isValidInputText,
    loader,
    onError,
    sendMessage,
    setText,
    text,
    startTypingIndicator,
    stopTypingIndicator,
  };
};
