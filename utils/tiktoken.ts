import { ChatBody, Message } from '@/types/chat';
import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';

import { get_encoding } from "@dqbd/tiktoken";
const encoding = get_encoding("cl100k_base");

// 计算token长度，isSend=true，方法默认是计算发送token长度
export const calTokenLength = async (req: ChatBody, isSend = true) => {
  const { model, messages, prompt } = req;

  let promptToSend = prompt;
  if (!promptToSend) {
    promptToSend = DEFAULT_SYSTEM_PROMPT;
  }

  const prompt_tokens = encoding.encode(promptToSend);
  let tokenCount = isSend ? prompt_tokens.length : 0;
  let messagesToSend: Message[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const tokens = encoding.encode(message.content);
    if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
      break;
    }
    tokenCount += tokens.length;
    messagesToSend = [message, ...messagesToSend];
  }

  return {
    tokenCount,
    messagesToSend
  };
}