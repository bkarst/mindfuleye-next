/** @type {import('next').NextConfig} */
module.exports = {
  // async redirects() {
  //   return [
  //     { source: '/', destination: '/home', permanent: false } // a permanent redirect
  //   ]
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/home',
  //       destination: 'https://azure-world-943235.framer.app/'
  //     }
  //   ]
  // },
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "**",
      },
    ],
  },

  skipTrailingSlashRedirect: true,
};
