import createMDX from '@next/mdx'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
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
