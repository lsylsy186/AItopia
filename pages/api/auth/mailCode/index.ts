// import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';
import { redisClient } from '@/lib/redis';

import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const apiKey = process.env.MAILGUN_EMAIL_API_KEY!;
const domain = process.env.MAILGUN_EMAIL_DOMAIN!;

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({ username: 'api', key: apiKey || 'key-yourkeyhere' });

const sendEmail = async (
  to: string[],
  name: string,
  code: string,
) => {
  const messageData = {
    from: `Mailgun Sandbox <postmaster@${domain}>`,
    to: to[0],
    subject: `Your activation code: ${code}`,
    template: 'verification_code',
    'h:X-Mailgun-Variables': JSON.stringify({ name, code }),
  };
  const result = await mg.messages.create(domain, messageData);

  return result;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { email } = req.body;

    const code = await redisClient.new(email);
    const result = await sendEmail([email], '', code.toString());
    if (result) {
      res.status(200).json({
        success: true,
        message: '请求成功',
        data: {}
      } as IResponse);
    } else {
      res.status(500).json({ error: 'Error' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;