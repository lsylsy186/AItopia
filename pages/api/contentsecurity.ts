import { NextApiRequest, NextApiResponse } from 'next';
import { IResponse } from '@/types/response';
import { textSecurity } from "@/lib/content";

interface RequestBody {
  text: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const body = req.body as RequestBody;
  const security = await textSecurity(body.text);
  try {
    res.status(200).json({
      success: true,
      message: '请求成功',
      data: security
    } as IResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;