import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const query = req.query as any;
    const accessToken = req.headers['authorization'] as string;
    if (!accessToken || !verifyJwt(accessToken)) {
      res.status(401).json(JSON.stringify({ error: 'unauthorized' }));
    }
    const user = await prisma.user.findFirst({
      where: {
        id: query.id
      }
    });
    res.status(200).json(JSON.stringify(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;