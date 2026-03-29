import type { NextConfig } from "next";

const securityHeaders = [
  // Impede que a app seja embebida em iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Bloqueia sniffing de MIME type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla informação de referrer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Força HTTPS durante 1 ano (activar apenas após confirmar HTTPS em produção)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Desactiva funcionalidades de browser desnecessárias
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplicar a todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
