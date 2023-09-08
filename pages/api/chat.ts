import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import prisma from "@/lib/prismadb";
import { OpenAIError, OpenAIStream } from '@/utils/server';
import { ChatBody, Message } from '@/types/chat';
import { get_encoding } from "@dqbd/tiktoken";
import { NextApiRequest, NextApiResponse } from 'next';

const updateBalance = async (tokenCount: number, userId: string, balance: number) => {
  const remainBalance = Math.round(tokenCount / 10);
  const newBalance = (balance || 0) - remainBalance;

  if (newBalance < 0) return false;

  const result = await prisma.user.update({
    where: { id: userId }, // 要更新的用户的查询条件
    data: {
      account: {
        update: {
          where: { accountId: userId },
          data: { balance: newBalance }
        }
      }
    },
    include: { account: true }
  });

  if (result) return true;
  else return false;
}

// 计算token长度，isSend=true，方法默认是计算发送token长度
const calTokenLength = async (req: ChatBody, promptToSend: string, isSend = true) => {
  const { model, messages } = req;
  const encoding = get_encoding("cl100k_base");

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

  encoding.free();
  return {
    tokenCount,
    messagesToSend
  };
}

const consumeStreamOnServer = async (reqBody: ChatBody, stream: ReadableStream<any>) => {
  let done = false;
  let text = '';
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    text += chunkValue;
  }

  const { tokenCount } = await calTokenLength({ ...reqBody, messages: [{ content: text, role: 'assistant' }] }, '', false);
  const user = await prisma.user.findFirst({
    where: {
      id: reqBody.userId
    },
    include: {
      posts: true,
      account: true,
      profile: true,
    }
  });
  const { account } = user || {};
  const result = await updateBalance(tokenCount, reqBody.userId || '', account?.balance || 0);
  return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const reqBody = (await req.body) as ChatBody;
    const { model, key, prompt, temperature, userId, balance } = reqBody;

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const { tokenCount, messagesToSend } = await calTokenLength(reqBody, promptToSend);
    const sentTokenresult = await updateBalance(tokenCount, userId || '', balance);
    if (!sentTokenresult) res.status(500).json({ error: 'Sent Token consuming error' });


    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);

    const [stream1, stream2] = stream.tee();
    const responseTokenResult = consumeStreamOnServer(reqBody, stream2);
    if (!responseTokenResult) res.status(500).json({ error: 'Response Token consuming error' });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = stream1.getReader();
    const processStream = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          res.write(value);
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        res.status(500);
      } finally {
        res.end();
      }
    };
    await processStream();
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error' });
    }
  }
};

export default handler;
