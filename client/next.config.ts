import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.buymeacoffee.com https://cdn.buymeacoffee.com https://www.googletagmanager.com https://www.google-analytics.com https://m.stripe.network;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.buymeacoffee.com data:;
  font-src 'self' https://cdn.buymeacoffee.com data:;
  connect-src 'self' https://www.buymeacoffee.com https://www.google-analytics.com https://www.googletagmanager.com https://q.stripe.com https://api.stripe.com https://boba.report http://localhost:3000;
  frame-src 'self' https://www.buymeacoffee.com https://buymeacoffee.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isProduction ? "upgrade-insecure-requests;" : ""}
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
