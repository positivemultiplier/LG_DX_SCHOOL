/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 서버 외부 패키지 설정
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;