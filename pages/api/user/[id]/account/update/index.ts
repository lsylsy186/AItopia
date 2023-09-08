import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const query = req.query as any;
    const body = req.body;

    const result = await prisma.user.update({
      where: { id: query.id }, // 要更新的用户的查询条件
      data: {
        account: {
          update: {
            where: { accountId: query.id },
            data: body
          }
        }
      },
      include: { account: true }
    });

    console.log('result', result);

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