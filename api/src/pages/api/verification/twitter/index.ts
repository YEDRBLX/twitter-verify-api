import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient } from 'mongodb'
import config from '../../../../config'

let mongoClient
let db
let collection

export default async function (req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'GET') {
		if (req.headers.authorization != process.env.AUTH)
			return res.status(401).end('Unauthorized')

		const { follower } = req.query

		if (!follower) {
			return res.status(400).json({ message: 'Invalid parameters' })
		}

		if (!mongoClient) {
			mongoClient = new MongoClient(process.env.MONGO_URI as string)
			await mongoClient.connect()
		}
		if (!db) {
			db = mongoClient.db('main')
		}
		if (!collection) {
			collection = db.collection('twitter-followers')
		}

		return new Promise(async (resolve) => {
			let docs = []

			let query = new RegExp(['^', follower, '$'].join(''), 'i')

			await collection.find({ follower: query }).forEach((d) => {
				if (d.following) {
					if (!docs.find((v) => v == d.following)) {
						docs.push(d.following as never)
					}
				}
			})

			resolve(docs)
		})
			.then((docs) => {
				if (!docs) {
					return res.status(200).json({ isFollowing: false })
				}

				return res.status(200).json({
					isFollowing: docs,
				})
			})
			.catch((err) => {
				console.error(err)
				return res.status(500).json({ message: 'Internal server error' })
			})
	} else if (req.method === 'POST') {
		if (req.headers.authorization != process.env.AUTH)
			return res.status(401).end('Unauthorized')

		const { following } = req.query
		if (!following) {
			return res.status(400).json({ message: 'Invalid parameters' })
		}
		if (
			config.twitterTrackers.filter((v) => v.user === following).length === 0
		) {
			return res.status(400).json({ message: 'Invalid parameters' })
		}

		if (!mongoClient) {
			mongoClient = new MongoClient(process.env.MONGO_URI as string)
			await mongoClient.connect()
		}
		if (!db) {
			db = mongoClient.db('main')
		}
		if (!collection) {
			collection = db.collection('twitter-followers')
		}

		let docs = []

		for (let i = 0; i < req.body.length; i++) {
			let follower = req.body[i]

			if (!(await collection.findOne({ follower, following }))) {
				docs.push({ follower: follower, following: following } as never)
			}
		}

		const result = await collection.insertMany(docs)

		console.log(
			'Posted ' + result.insertedCount + ' followers - ' + following,
		)

		res.status(200).json({
			message: 'Success',
			amount: result.insertedCount,
		})
	} else {
		return res.status(400).json({ message: 'Method not allowed' })
	}
}
