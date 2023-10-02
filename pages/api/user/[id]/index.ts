import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, body } = req;
    const query = req.query as any;

    switch (method) {
      case 'GET':
        const user = await prisma.user.findFirst({
          where: {
            id: query.id
          },
          include: {
            posts: true,
            account: true,
            profile: true,
          }
        });
        const { password, ...result } = user || {};
        res.status(200).json({
          success: true,
          message: '请求成功',
          data: result
        } as IResponse);
        break
      case 'POST':
        const response = await prisma.user.update({
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

        res.status(200).json({
          success: true,
          message: '请求成功',
          data: response
        } as IResponse);
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;