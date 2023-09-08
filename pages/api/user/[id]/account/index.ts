import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const query = req.query as any;
    const userAccount = await prisma.account.findMany({
      where: { accountId: query.id },
    });
    res.status(200).json({
      success: true,
      message: '请求成功',
      data: userAccount
    } as IResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;