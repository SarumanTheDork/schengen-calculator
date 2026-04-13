import './globals.css';

export const metadata = {
  title: 'Schengen 90/180 Day Calculator — xnomadic',
  description: 'Free Schengen calculator for Indian travelers. Track your 90-day limit, plan future trips, and avoid overstaying in the Schengen Area.',
  keywords: 'schengen calculator, 90 180 rule, schengen visa calculator, india schengen, europe visa calculator',
  openGraph: {
    title: 'Schengen 90/180 Day Calculator — xnomadic',
    description: 'Track your Schengen days. Know exactly how long you can stay in Europe.',
    type: 'website',
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
