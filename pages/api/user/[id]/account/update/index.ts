import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const query = req.query as any;
    const body = req.body;

    const { data } = body;
    if (!data.role || data.role !== 'User') {
      res.status(500).json({ error: 'Error' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: query.id }, // 要更新的用户的查询条件
      data: {
        name: data.name,
      },
    });

    const { password, ...result } = user;
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