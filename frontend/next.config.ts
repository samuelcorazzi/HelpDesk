import type { NextConfig } from 'next';
// Configuração do framework; o padrão cobre as necessidades atuais.
import path from 'node:path';

const nextConfig: NextConfig = {
  agentRules: false,
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
