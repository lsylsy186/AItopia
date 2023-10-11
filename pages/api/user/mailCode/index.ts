import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const apiKey = process.env.MAILGUN_EMAIL_API_KEY!;
const domain = process.env.MAILGUN_EMAIL_DOMAIN!;

const sendEmail = async (
  to: string[],
  name: string,
  code: string,
) => {
  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  const formData = new URLSearchParams();
  formData.append('from', `Mailgun Sandbox <postmaster@${domain}>`);
  to.forEach((recipient) => formData.append('to', recipient));
  formData.append('subject', `Your activation code: ${code}`);
  formData.append('template', 'verification_code');
  formData.append('h:X-Mailgun-Variables', JSON.stringify({ name, code }));

  const response = await fetch(url, {
    cache: 'no-store',
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  return response.ok;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const body = req.body;
    const { email, identity } = body;
    // new code
    // const code = await this.redisService.authCode.new(identity);
    const code = '';
    const result = await sendEmail([identity], '', code.toString());
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