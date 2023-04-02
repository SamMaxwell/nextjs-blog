import { NextApiResponse } from 'next';

const handler = (_, res: NextApiResponse) => {
  res.status(200).json({ text: 'Hello test' });
};

export default handler;
