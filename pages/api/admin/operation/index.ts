import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, body } = req;
    let whereClause = {};
    switch (method) {
      case 'GET':
        const operations = await prisma.operation.findMany({
          where: whereClause,
          select: {
            opType: true,
            op: true,
            createdAt: true,
            user: true,
            id: true,
          }
        });
        res.status(200).json({
          success: true,
          message: '请求成功',
          data: operations
        } as IResponse);
        break
      case 'POST':
        const response = await prisma.operation.create({
          data: {
            opType: body.opType,
            op: body.op,
            user: body.user,
          },
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