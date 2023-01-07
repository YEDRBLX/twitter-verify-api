import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

let socketio

export default async function (req, res) {
	if (!res.socket.server.io) {
		console.log('New Socket.io server...')
		const httpServer: NetServer = res.socket.server as any
		socketio = new ServerIO(httpServer, {
			cors: {
				origin: '*',
			},
		})

		res.socket.server.io = socketio

		socketio.on('connection', socket => {
			socket.on('input-change', msg => {
			  socket.broadcast.emit('update-input', msg)
			})
		 })
	}
	res.end()
}
