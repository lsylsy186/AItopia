import React, {
  ChangeEvent,
  FC,
  useEffect,
  useRef,
  useState,
} from "react";
import { useModel } from '@/hooks';
import message from 'antd/lib/message';
import { useMessageInputCore } from "../message-input";
import { useResizeObserver } from "../helpers";
import {
  IconFileUpload,
  IconX,
  IconPhotoPlus,
} from '@tabler/icons-react';
import { uploadPhotoFromClient } from '@/lib/blob';

/**
 * Allows users to compose messages using text and emojis
 * and automatically publish them on PubNub channels upon sending.
 */
export const ImageUploader: FC<any> = (props: any) => {
  const {
    draftMessage,
    fileUpload,
    onBeforeSend,
    onSend,
    senderInfo,
    typingIndicator,
    content,
    setContent,
  } = props;

  const {
    clearInput,
    file,
    setFile,
    onError,
  } = useMessageInputCore({ draftMessage, senderInfo, onSend, onBeforeSend, typingIndicator });

  const [uploadError, setUploadError] = useState('');
  const { isUploading, setIsUploading } = useModel('global');

  useEffect(() => {
    if (!!uploadError) {
      message.error(uploadError);
      setUploadError('');
    }
  }, [uploadError]);


  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resizeTextAreaEntry = useResizeObserver(inputRef as any);
  const textAreaWidth = resizeTextAreaEntry?.contentRect.width;

  const autoSize = () => {
    const input = inputRef.current;
    if (!input) return;

    setTimeout(() => {
      input.style.cssText = `height: auto;`;
      input.style.cssText = `height: ${input.scrollHeight}px;`;
    }, 0);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file: any = event?.target?.files?.[0];
      if (file) {
        const extension = file.name.split('.').pop();
        uploadPhotoFromClient(file, extension).then(({ url }) => {
          setFile(url);
          setContent(url);
        }).catch((error) => {
          setIsUploading(false);
          setUploadError(`Upload Error: ${error.message}`);
        });

      }
    } catch (e) {
      onError(e as any);
    }
  };

  const handleRemoveFile = () => {
    autoSize();
    clearInput();
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    autoSize();
  }, [file, textAreaWidth, content]);

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
          <button aria-label={addTitle} disabled={isUploading} title={addTitle} onClick={() => fileRef?.current?.click()}>
            {fileUpload === "image" ? <IconPhotoPlus /> : <IconFileUpload />}
          </button>
          <input
            accept={fileUpload === "image" ? "image/*" : "*"}
            className="hidden"
            data-testid="file-upload"
            id="file-upload"
            onChange={handleFileChange}
            ref={fileRef}
            type="file"
            disabled={isUploading}
          />
        </>
      )}
    </>
  );
};