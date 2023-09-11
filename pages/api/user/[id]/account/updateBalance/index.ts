import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const query = req.query as any;
    const body = req.body;

    const o_user = await prisma.user.findFirst({
      where: { id: query.id }, // 要更新的用户的查询条件
      include: {
        posts: true,
        account: true,
        profile: true,
      }
    });
    const { account } = o_user || {};
    const balance = account?.balance;
    const subBalance = body.subBalance;
    if (!balance || !subBalance) res.status(500).json({ error: 'Error' });

    const newBalance = (balance || 0) - subBalance;
    if (newBalance < 0 && !!body?.isSent) {
      res.status(403).json({ error: 'Token consuming error' });
    }
    const user = await prisma.user.update({
      where: { id: query.id }, // 要更新的用户的查询条件
      data: {
        account: {
          update: {
            where: { accountId: query.id },
            data: { balance: newBalance }
          }
        }
      },
      include: { account: true }
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