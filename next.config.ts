import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        'https://6000-firebase-studio-1749116506672.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev',
        // You might want to add other specific development origins here if they vary
        // or consider a more generic pattern if Next.js supports it and you trust your dev environment.
    ],
  },
};

export default nextConfig;
