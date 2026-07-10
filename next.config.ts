import createMDX from '@next/mdx'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
}

const withMDX = createMDX({
  options: {},
})

export default withMDX(nextConfig)
