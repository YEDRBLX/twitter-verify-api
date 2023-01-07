import type { NextApiRequest, NextApiResponse } from 'next'
import { Server } from 'socket.io'

export default async function (req: NextApiRequest, res) {
	if (req.method === 'GET') {
		if (req.headers.authorization != process.env.AUTH)
			return res.status(401).end('Unauthorized')

		const { user } = req.query

		if (!user) {
			return res.status(400).json({ message: 'Invalid user' })
		}

		if (!res.socket.server.io) {
			return res.status(500).json({ message: 'Socket.io server not found' })
		}

		const socketio: Server = res.socket.server.io
		const clientSocket = socketio.sockets.sockets.values().next().value

		return new Promise((resolve) => {
			clientSocket.emit('discord-verify', user, (result: boolean) => {
				if (result) {
					resolve(true)
					return res.status(200).json({ verified: true })
				} else {
					resolve(false)
					return res.status(200).json({ verified: false })
				}
			})
		})
	} else {
		return res.status(405).json({ message: 'Method not allowed' })
	}
}
