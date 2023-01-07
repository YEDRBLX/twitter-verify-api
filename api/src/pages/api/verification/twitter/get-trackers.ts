import type { NextApiRequest, NextApiResponse } from 'next'
import config from '../../../../config'

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		if (req.headers.authorization != process.env.AUTH)
			return res.status(401).end('Unauthorized')

		return res.status(200).json(config.twitterTrackers)
	} else {
		return res.status(400).json({ message: 'Method not allowed' })
	}
}
