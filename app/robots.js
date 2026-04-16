export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://xnomadic.com/tools/schengen-calculator/sitemap.xml',
  }
}
