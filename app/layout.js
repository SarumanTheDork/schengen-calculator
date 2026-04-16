import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  metadataBase: new URL('https://xnomadic.com'),
  title: 'Most Comprehensive Schengen 90/180 Calculator for Indians — xnomadic',
  description: 'The most comprehensive Schengen calculator for Indian travelers: track 90/180 days, simulate future trips, avoid overstays, and download a detailed visa-file checklist.',
  keywords: ['schengen calculator', '90 180 rule', 'schengen visa calculator', 'india schengen', 'europe visa calculator', 'schengen days left', 'schengen overstay checker'],
  authors: [{ name: 'xnomadic' }],
  creator: 'xnomadic',
  publisher: 'xnomadic',
  icons: {
    icon: [{ url: '/icon', sizes: '64x64', type: 'image/png' }],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'Most Comprehensive Schengen 90/180 Calculator — xnomadic',
    description: 'Track Schengen days, simulate future stays, and prep with an India-focused checklist in one tool.',
    url: '/tools/schengen-calculator/',
    siteName: 'xnomadic Calculator',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Schengen 90/180 Day Calculator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Most Comprehensive Schengen 90/180 Calculator',
    description: 'One tool for day tracking, future stay simulation, and visa-file prep for Indian travelers.',
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
