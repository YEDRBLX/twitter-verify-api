/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/socket.io',
				destination: '/api/socket.io',
			},
		]
	},
}

module.exports = nextConfig
