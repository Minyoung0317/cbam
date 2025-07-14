// import withPlugins from 'next-compose-plugins';

// const nextConfig = withPlugins([], {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// });

// export default nextConfig;

// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // ✅ 이 옵션이 있다면 제거하거나 false로 설정
    // css: false,
  },
}

export default nextConfig
