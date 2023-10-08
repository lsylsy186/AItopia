import React, {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  DetailedHTMLProps,
  TextareaHTMLAttributes,
} from "react";
import { useModel } from '@/hooks';
import message from 'antd/lib/message';
import { Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';
import { CommonMessageInputProps, useMessageInputCore } from "../message-input";
import { useTranslation } from 'next-i18next';
import { useOuterClick, useResizeObserver } from "../helpers";
import EmojiPicker, {
  EmojiStyle,
  EmojiClickData,
  Categories,
  SuggestionMode,
} from "emoji-picker-react";
import {
  IconSend,
  IconMoodSmile,
  IconKeyboard,
  IconMicrophone,
  IconMicrophoneOff,
} from '@tabler/icons-react';
import { ImageUploader } from '../ImageUploader';
// import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import styles from './styles.module.css'

export type MessageInputProps = CommonMessageInputProps & {
  /** Option to hide the Send button. */
  hideSendButton?: boolean;
  /** Callback to handle an event when the text value changes. */
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Callback to handle an event when the key is pressed in textarea. */
  onKeyPress?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: any;
  messageIsStreaming: any;
  selectedConversation: any;
  setContent: any;
  updatePromptListVisibility: any;
  content: any;
  handleKeyDown: any;
  // 等同于其他组件的onSend，为了不和原本input冲突，另起名称
  onMsgSend: (message: Message, plugin: Plugin | null, type?: any) => void;
} & Omit<
  DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
  | "className"
  | "data-testid"
  | "disabled"
  | "onChange"
  | "onKeyPress"
  | "ref"
  | "rows"
  | "value"
>;

/**
 * Allows users to compose messages using text and emojis
 * and automatically publish them on PubNub channels upon sending.
 */
export const MessageInput: FC<MessageInputProps> = (props: MessageInputProps) => {
  const {
    actionsAfterInput,
    disabled,
    draftMessage,
    extraActionsRenderer,
    fileUpload,
    hideSendButton,
    onBeforeSend,
    onChange,
    onKeyPress,
    onSend,
    onMsgSend,
    sendButton,
    senderInfo,
    typingIndicator,
    handleSend,
    messageIsStreaming,
    selectedConversation,
    content,
    setContent,
    updatePromptListVisibility,
    handleKeyDown,
    ...otherTextAreaProps
  } = props;

  const {
    file,
    isValidInputText,
    onError,
    startTypingIndicator,
    stopTypingIndicator,
  } = useMessageInputCore({ draftMessage, senderInfo, onSend, onBeforeSend, typingIndicator });
  // const [isTextInput, setIsTextInput] = useState(true);
  const { t } = useTranslation('chat');

  const {
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    finalTranscript,
    transcript,
    resetTranscript
  } = useSpeechRecognition();

  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (!!uploadError) {
      message.error(uploadError);
      setUploadError('');
    }
  }, [uploadError]);

  useEffect(() => {
    setContent(transcript);
  }, [transcript]);

  // 暂时屏蔽：录音完成自动发送功能
  // useEffect(() => {
  //   if (!isTextInput) {
  //     if (!!finalTranscript) {
  //       console.log('finalTranscript', finalTranscript);
  //       handleSend(finalTranscript);
  //       resetTranscript();
  //     }
  //   }
  // }, [finalTranscript, isTextInput]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [emojiPickerShown, setEmojiPickerShown] = useState(false);
  const [inputHeight, setInputHeight] = useState(inputRef?.current?.scrollHeight || 0);
  const resizeTextAreaEntry = useResizeObserver(inputRef as any);
  const textAreaWidth = resizeTextAreaEntry?.contentRect.width;
  const pickerRef = useOuterClick((event) => {
    if ((event?.target as Element).closest(".pn-msg-input__emoji-toggle")) return;
    setEmojiPickerShown(false);
  });
  /*
  /* Helper functions
  */

  const autoSize = () => {
    const input = inputRef.current;
    if (!input) return;

    setTimeout(() => {
      input.style.cssText = `height: auto;`;
      input.style.cssText = `height: ${input.scrollHeight}px;`;
      setInputHeight(input.scrollHeight);
    }, 0);
  };

  /*
  /* Event handlers
  */

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const { value: newText } = event.target;
      if (typingIndicator) {
        newText.length ? startTypingIndicator() : stopTypingIndicator();
      }
      const maxLength = selectedConversation?.model.maxLength;

      if (maxLength && newText.length > maxLength) {
        alert(
          t(
            `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
            { maxLength, valueLength: newText.length },
          ),
        );
        return;
      }
      onChange && onChange(event);
      setContent(newText);
      updatePromptListVisibility(newText);
    } catch (e) {
      onError(e as any);
    }
  };

  const handleEmojiInsertion = useCallback(
    (emoji: EmojiClickData, event: MouseEvent) => {
      try {
        if (!emoji?.emoji) return;
        setContent(content + emoji.emoji);
        setEmojiPickerShown(false);
        if (inputRef.current) inputRef.current.focus();
      } catch (e) {
        onError(e as any);
      }
    },
    [onError, content, setContent]
  );

  useEffect(() => {
    autoSize();
  }, [file, textAreaWidth, content]);

  const renderEmojiPicker = () => {
    const title = "Add an emoji";
    return (
      <>
        <button aria-label={title} title={title} onClick={() => setEmojiPickerShown(true)}>
          <IconMoodSmile />
        </button>

        {emojiPickerShown && (
          <div
            ref={pickerRef}
            className={styles["pnMsgInputEmojiPicker"]}
            style={actionsAfterInput ? { left: "unset" } : { right: "unset" }}
          >
            <EmojiPicker
              height={350}
              onEmojiClick={handleEmojiInsertion}
              emojiStyle={EmojiStyle.NATIVE}
              lazyLoadEmojis={true}
              autoFocusSearch={false}
              suggestedEmojisMode={SuggestionMode.FREQUENT}
              categories={[
                {
                  name: "Smiles & Emotions",
                  category: Categories.SMILEYS_PEOPLE
                },
                {
                  name: "Fun and Games",
                  category: Categories.ACTIVITIES
                },
                {
                  name: "Flags",
                  category: Categories.FLAGS
                },
                {
                  name: "Yum Yum",
                  category: Categories.FOOD_DRINK
                }
              ]}
            />
          </div>
        )}
      </>
    );
  };

  const renderActions = () => (
    <div className={styles["pnMsgInputIcons"]}>
      <div className="flex pn-msg-input__emoji-toggle">
        {!disabled && renderEmojiPicker()}
      </div>
      {!disabled && fileUpload && <ImageUploader
        draftMessage={draftMessage}
        fileUpload={fileUpload}
        onBeforeSend={onBeforeSend}
        onSend={onMsgSend}
        handleSend={handleSend}
        senderInfo={senderInfo}
        typingIndicator={typingIndicator}
        content={content}
        setContent={setContent}
      />}
      {extraActionsRenderer && extraActionsRenderer()}
    </div>
  );

  const openMicrophoneMode = () => {
    console.log('browserSupportsSpeechRecognition', browserSupportsSpeechRecognition);
    console.log('isMicrophoneAvailable', isMicrophoneAvailable);
    if (!browserSupportsSpeechRecognition) {
      message.warning('抱歉，当前浏览器环境无法支持语音功能');
    } else if (!isMicrophoneAvailable) {
      message.warning('抱歉，当前设备语音功能无法打开，请检查麦克风相关设置');
    } else {
      // setIsTextInput(false)
      resetTranscript();
      SpeechRecognition.startListening({ language: 'zh-CN', continuous: true });
    }
  }

  const closeMicrophoneMode = () => {
    SpeechRecognition.stopListening();
  }


  return (
    <>
      {/* <Modal
        title="录音中"
        centered
        open={isVoiceListening}
        mask={false}
        onCancel={SpeechRecognition.stopListening as any}
        maskClosable={true}
        footer={null}
        closeIcon={null}
      >
        {transcript || '请用麦克风进行语音输入...'}
      </Modal> */}
      {/* <FloatButton
        shape="circle"
        style={{  }}
        icon={<div className="flex align-middle flex-row justify-center bg-transparent border-none">
          <div className="text-center">
            <span className={`${styles.ping} animate-ping absolute w-16 h-16 opacity-50 rounded-full`}></span>
            <div
              onClick={SpeechRecognition.stopListening as any}
              className={`${styles.stopTalk} w-16 h-16`}
            >
              <IconPlayerPause size={28} />
            </div>
          </div>
        </div>}
      /> */}
      {listening && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
          {/* 蒙层覆盖整个视口并设置一个半透明的背景 */}
          <div className="relative flex align-middle flex-row justify-center bg-transparent border-none">
            <div className="text-center">
              <span className={`${styles.ping} animate-ping absolute w-16 h-16 opacity-50 rounded-full`}></span>
              <div
                onClick={closeMicrophoneMode}
                className={`${styles.stopTalk} w-16 h-16`}
              >
                <IconMicrophoneOff size={28} />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* {isTextInput ? */}
      <div className="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] sm:mx-4">
        <div
          className={`${styles['msgInput']} ${disabled ? styles['pnMsgInputDisabled'] : ""}`}
        >
          <div className={styles['pnMsgInputWrapper']}>
            {!actionsAfterInput && renderActions()}
            <div className={styles.textContainer} style={{ height: `${inputHeight + 14}px` }}>
              <textarea
                {...otherTextAreaProps}
                className={styles['pnMsgInputTextarea']}
                data-testid="message-input"
                disabled={disabled || !!file}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder='输入信息'
                ref={inputRef}
                rows={1}
                value={content}
              />
              <div
                className={styles['microPhone']}
                onClick={openMicrophoneMode}
              >
                {browserSupportsSpeechRecognition ? <IconMicrophone size={22} /> : <IconMicrophoneOff size={22} />}
              </div>
            </div>
            {actionsAfterInput && renderActions()}
            <button
              className={`${styles['pnMsgInputSend']} ${isValidInputText() && styles['pnMsgInputSend--active']} `}
              onClick={handleSend}
            >
              {messageIsStreaming ? (
                <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
              ) : (
                <IconSend size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* : <div className="relative mx-2 flex w-full flex-grow flex-col">
          {!isTextInput && !listening && (
            <div className="flex align-middle flex-row justify-center bg-transparent border-none mr-2">
              <div
                onClick={() =>
                  setIsTextInput(true)
                }
                className={`${styles.keyboard} -ml-16 md:-ml-24 mr-8 md:mr-12`}
              >
                <IconKeyboard size={18} />
              </div>
              <div className="text-center">
                <div
                  className={`${styles.talk} w-16 h-16`}
                  onClick={() => SpeechRecognition.startListening({ language: 'zh-CN' }) as any}
                >
                  <IconMicrophone size={28} />
                </div>
              </div>
            </div>
          )}
        </div>} */}
    </>
  );
};

MessageInput.defaultProps = {
  disabled: false,
  fileUpload: undefined,
  hideSendButton: false,
  sendButton: <IconSend />,
  senderInfo: false,
  typingIndicator: false,
};