import './globals.css';

export const metadata = {
  metadataBase: new URL('https://xnomadic.com'),
  title: 'Schengen 90/180 Day Calculator — xnomadic',
  description: 'Free Schengen calculator for Indian travelers. Track your 90-day limit, plan future trips, and avoid overstaying in the Schengen Area.',
  keywords: ['schengen calculator', '90 180 rule', 'schengen visa calculator', 'india schengen', 'europe visa calculator', 'schengen days left', 'schengen overstay checker'],
  authors: [{ name: 'xnomadic' }],
  creator: 'xnomadic',
  publisher: 'xnomadic',
  icons: {
    icon: [{ url: '/icon', sizes: '64x64', type: 'image/png' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Schengen 90/180 Day Calculator — xnomadic',
    description: 'Track your Schengen days. Know exactly how long you can stay in Europe without overstaying.',
    url: '/tools/schengen-calculator/',
    siteName: 'xnomadic Calculator',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Schengen 90/180 Day Calculator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schengen 90/180 Day Calculator',
    description: 'Free Schengen calculator for Indian travelers. Plan future trips and avoid overstaying.',
    creator: '@xnomadic',
    images: ['/twitter-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/tools/schengen-calculator/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
