import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default (_req: NextApiRequest, res: NextApiResponse<Data>) => {
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
