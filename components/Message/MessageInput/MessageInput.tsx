import React, {
  ChangeEvent,
  FC,
  KeyboardEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  DetailedHTMLProps,
  TextareaHTMLAttributes,
} from "react";
import { CommonMessageInputProps, useMessageInputCore } from "../message-input";
import { useTranslation } from 'next-i18next';
import { EmojiPickerElementProps } from "../types";
import { useOuterClick, useResizeObserver } from "../helpers";
import {
  IconFileUpload,
  IconSend,
  IconX,
  IconPhotoPlus,
  IconMoodSmile
} from '@tabler/icons-react';
import styles from './styles.module.css'

export type MessageInputProps = CommonMessageInputProps & {
  /** Option to hide the Send button. */
  hideSendButton?: boolean;
  /** Option to pass in an emoji picker if you want it to be rendered in the input. For more details, refer to the Emoji Pickers section in the docs. */
  emojiPicker?: ReactElement<EmojiPickerElementProps>;
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
    emojiPicker,
    extraActionsRenderer,
    fileUpload,
    hideSendButton,
    onBeforeSend,
    onChange,
    onKeyPress,
    onSend,
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
    clearInput,
    file,
    setFile,
    isValidInputText,
    loader,
    onError,
    sendMessage,
    startTypingIndicator,
    stopTypingIndicator,
  } = useMessageInputCore({ draftMessage, senderInfo, onSend, onBeforeSend, typingIndicator });

  const { t } = useTranslation('chat');

  const [emojiPickerShown, setEmojiPickerShown] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resizeTextAreaEntry = useResizeObserver(inputRef as any);
  const textAreaWidth = resizeTextAreaEntry?.contentRect.width;
  const pickerRef = useOuterClick((event) => {
    if ((event?.target as Element).closest(".pn-msg-input__emoji-toggle")) return;
    console.log('event', event);
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
      updatePromptListVisibility(value);
    } catch (e) {
      onError(e);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event?.target?.files?.[0];
      setFile(file);
      setContent(file.name);
    } catch (e) {
      onError(e);
    }
  };

  const handleEmojiInsertion = useCallback(
    (emoji: { native: string }) => {
      try {
        if (!("native" in emoji)) return;
        setContent(content + emoji.native);
        setEmojiPickerShown(false);
        if (inputRef.current) inputRef.current.focus();
      } catch (e) {
        onError(e);
      }
    },
    [onError, content, setContent]
  );

  const handleRemoveFile = () => {
    autoSize();
    clearInput();
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    autoSize();
  }, [file, textAreaWidth, content]);

  /*
  /* Renderers
  */

  const renderFileUpload = () => {
    const addTitle = "Add a file";
    const removeTitle = "Remove the file";
    return (
      <>
        {file ? (
          <button aria-label={removeTitle} title={removeTitle} onClick={handleRemoveFile}>
            <IconX />
          </button>
        ) : (
          <>
            <button aria-label={addTitle} title={addTitle} onClick={() => fileRef?.current?.click()}>
              {fileUpload === "image" ? <IconPhotoPlus /> : <IconFileUpload />}
            </button>
            <input
              accept={fileUpload === "image" ? "image/*" : "*"}
              className={styles["pnMsgInputFileInput"]}
              data-testid="file-upload"
              id="file-upload"
              onChange={handleFileChange}
              ref={fileRef}
              type="file"
            />
          </>
        )}
      </>
    );
  };
  console.log('emojiPickerShown', emojiPickerShown);
  const renderEmojiPicker = () => {
    const title = "Add an emoji";
    return (
      <>
        <button aria-label={title} title={title} onClick={() => setEmojiPickerShown(true)}>
          <IconMoodSmile />
        </button>

        {emojiPickerShown && (
          <div
            className={styles["pnMsgInputEmojiPicker"]}
            ref={pickerRef}
            style={actionsAfterInput ? { left: "unset" } : { right: "unset" }}
          >
            {React.cloneElement((emojiPicker as any), { onEmojiSelect: handleEmojiInsertion })}
          </div>
        )}
      </>
    );
  };

  const renderActions = () => (
    <div className={styles["pnMsgInputIcons"]}>
      <div className="flex pn-msg-input__emoji-toggle">
        {!disabled && emojiPicker && renderEmojiPicker()}
      </div>
      {!disabled && fileUpload && renderFileUpload()}
      {extraActionsRenderer && extraActionsRenderer()}
    </div>
  );

  return (
    <div
      className={`${styles['pn-msg-input']} ${disabled ? styles['pnMsgInputDisabled'] : ""}`}
    >
      <div className={styles['pnMsgInputWrapper']}>
        {!actionsAfterInput && renderActions()}
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
        {actionsAfterInput && renderActions()}
        <button
          className={`${styles['pnMsgInputSend']} ${isValidInputText() && styles['pnMsgInputSend--active']} `}
          onClick={handleSend}
        >
          {messageIsStreaming ? (
            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
          ) : (
            <IconSend size={22} />
          )}
        </button>
      </div>
    </div>
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
