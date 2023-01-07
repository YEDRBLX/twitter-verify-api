import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import config from '../../../config'

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		if (req.headers.authorization != process.env.AUTH)
			return res.status(401).end('Unauthorized')

		const { channelId } = req.query

		if (!channelId) {
			return res.status(400).json({ message: 'Invalid channel id' })
		}

		if (!process.env.YOUTUBE_API_KEY) {
			return res.status(400).json({ message: 'Invalid YouTube API key' })
		}

		return axios({
			method: 'get',
			url: `https://youtube.googleapis.com/youtube/v3/subscriptions`,
			params: {
				part: 'snippet',
				channelId: channelId,
				forChannelId: config.youtubeTrackers.join(','),
				maxResults: 50,
				key: process.env.YOUTUBE_API_KEY,
			},
		})
			.then((r) => {
				if (r.status === 200) {
					let data = [] as any

					if (r.data.items) {
						r.data.items.forEach((item) => {
							if (item.snippet.title) {
								data.push({
									name: item.snippet.title,
									id: item.snippet.resourceId.channelId,
								})
							}
						})
					}

					return res.status(200).json(data)
				} else {
					return res.status(500).json({ message: 'Internal server error' })
				}
			})
			.catch((err) => {
				let r = err.response

				if ((r.status === 403 || r.status === 404) && r.data.error) {
					return res
						.status(r.status)
						.json({ error: true, ...r.data.error.errors[0] })
				} else {
					console.log(r.status)
					console.log(r.data)
					return res.status(500).json({ message: 'Internal server error' })
				}
			})
	} else {
		return res.status(405).json({ message: 'Method not allowed' })
	}
}
