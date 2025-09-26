// next.config.ts
import type { NextConfig } from "next";
import os from "os";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

// ✅ detect LAN IP dynamically
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address; // e.g. 192.168.0.159
      }
    }
  }
  return "localhost";
}

const localIP = getLocalIP();
const certPath =
  process.env.NODE_EXTRA_CA_CERTS ||
  path.resolve(
    __dirname,
    "certs",
    "rootCA.pem" // adjust if you named it differently
  );

// ✅ log info at startup
if (isDev) {
  console.log("----------------------------------------------------");
  console.log("🚀 Next.js Dev Server Starting...");
  console.log(`🌐 Detected LAN IP: https://${localIP}:3002`);
  console.log(`🔐 NODE_EXTRA_CA_CERTS: ${certPath}`);
  console.log("----------------------------------------------------");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  turbopack: isDev
    ? {
        resolveAlias: {
          underscore: "lodash",
        },
        resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".json"],
      }
    : undefined,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  ...(isDev && {
    allowedDevOrigins: [
      "192.168.0.159", // ✅ plain hostname (LAN IP)
      "localhost", // ✅ plain hostname
      "*.local-origin.dev", // ✅ wildcard example
    ],
    outputFileTracingRoot:
      "C:\\Users\\ogwog\\Source\\Repos\\Project\\Web Applications\\Community\\ceceportal",
  }),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(self), interest-cohort=(self)",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
      { protocol: "https", hostname: "i.pravatar.cc", pathname: "/**" },
    ],
    disableStaticImages: false,
    minimumCacheTTL: 60,
  },

  webpack: (config) => {
    if (!isDev) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
};

export default nextConfig;
