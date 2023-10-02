import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';
const voice = require("elevenlabs-node");

const handler = async (_: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const result = await voice.getModels(process.env.ELEVEN_LABS_API_KEY ?? '');
    res.status(200).json({
      success: true,
      message: '请求成功',
      data: result
    } as IResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;