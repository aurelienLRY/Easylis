/* @type {import('next').NextConfig} */
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    proxyClientMaxBodySize: "30mb",
    webpackMemoryOptimizations: true,
  },
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.app.goo.gl",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
