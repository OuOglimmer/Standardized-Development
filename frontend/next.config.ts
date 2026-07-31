import createMDX from '@next/mdx'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'
import type { NextConfig } from 'next'

const HALF_DAY_SECONDS = 12 * 60 * 60

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
  experimental: {
    staleTimes: {
      dynamic: HALF_DAY_SECONDS,
      static: HALF_DAY_SECONDS,
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' } as RemotePattern,
    ],
  },
}

const withMDX = createMDX({
  options: {},
})

export default withMDX(nextConfig)
