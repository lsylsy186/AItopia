import prisma from "@/lib/prismadb";
import * as bcrypt from 'bcrypt';
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const body = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email: body?.email,
      }
    });
    if (user && (await bcrypt.compare(body?.oldpassword, user.password))) {
      const user = await prisma.user.update({
        where: { email: body.email }, // 要更新的用户的查询条件
        data: {
          password: await bcrypt.hash(body?.password, 10),
        },
      });
      const { password, ...result } = user;
      res.status(200).json({
        success: true,
        message: '请求成功',
        data: result
      } as IResponse);
    } else {
      res.status(500).json({});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;