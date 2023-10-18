import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { verifyJwt } from "@/lib/jwt";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, query, headers } = req;
    let token: string = '';
    if (headers['authorization']?.startsWith("Bearer ")) {
      token = headers['authorization']?.substring(7);
    }

    const auth = await verifyJwt(token);
    const { role, productLine } = auth;

    const available = role === 'Super' || role === 'Admin';
    // && (productLine as string).toLowerCase() === match.toLowerCase());
    if (!available) {
      res.status(401).end(`"Access denied"`);
    }

    switch (method) {
      case 'GET':

        let whereClause = {};

        // 如果角色是Admin，我们只想获取与auth的productLine相同的用户
        if (role === 'Admin') {
          whereClause = {
            productLine: productLine
          };
        }

        const users = await prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            productLine: true,
            posts: true,
            profile: true,
            account: true,
            createdAt: true
            // 注意：这里没有选择 password
          }
        });
        res.status(200).json({
          success: true,
          message: '请求成功',
          data: users
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

      // case 'POST':
      //   const response = await prisma.user.update({
      //     where: { id: query.id }, // 要更新的用户的查询条件
      //     data: {
      //       account: {
      //         update: {
      //           where: { accountId: query.id },
      //           data: body
      //         }
      //       }
      //     },
      //     include: { account: true }
      //   });

      //   res.status(200).json({
      //     success: true,
      //     message: '请求成功',
      //     data: response
      //   } as IResponse);
      //   break