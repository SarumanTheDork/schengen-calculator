import { GUIDE_SLUGS } from "./lib/guides";

export default function sitemap() {
  return [
    {
      url: 'https://xnomadic.com/tools/schengen-calculator/',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://xnomadic.com/tools/schengen-calculator/checklist',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://xnomadic.com/tools/schengen-calculator/guides',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...GUIDE_SLUGS.map((slug) => ({
      url: `https://xnomadic.com/tools/schengen-calculator/guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
