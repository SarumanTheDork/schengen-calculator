export default function sitemap() {
  const guides = [
    'best-schengen-calculator-for-indians',
    'france-schengen-checklist-india',
    'salaried-indian-schengen-visa-checklist',
  ];

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
    ...guides.map((slug) => ({
      url: `https://xnomadic.com/tools/schengen-calculator/guides/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
