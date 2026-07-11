// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Dynamically check if the application is executing within a production container environment
    const isProd = process.env.NODE_ENV === 'production';
    
    // Fallback cleanly to localhost when working across decentralized local workstations
    const backendUrl = isProd 
      ? 'https://eventista-backend-deployment.onrender.com' // Deployed production backend base URL
      : 'http://localhost:5000';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`, // Upstream Microservice Reverse Proxy Target
      },
    ]
  },
}

module.exports = nextConfig;