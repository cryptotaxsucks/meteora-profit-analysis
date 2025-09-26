/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.worker\.(js|ts)$/i,
      use: { loader: "worker-loader", options: { inline: "no-fallback" } },
    });
    config.resolve.extensions.push(".worker.ts", ".worker.js");
    return config;
  },
  // (Optional) while iterating, you can unblock builds:
  // eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
