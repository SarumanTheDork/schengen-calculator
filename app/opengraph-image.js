import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(180deg, #F8FAFF, #EEF4FF)',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: '#DBEAFE',
              color: '#1D4ED8',
              fontSize: '28px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            90
          </div>
          <div
            style={{
              color: '#1E293B',
              fontSize: '34px',
              fontWeight: 700,
            }}
          >
            Schengen Calculator
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              color: '#0F172A',
              fontSize: '66px',
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              maxWidth: '1040px',
            }}
          >
            Track your Schengen 90/180 days accurately
          </div>
          <div
            style={{
              color: '#475569',
              fontSize: '32px',
              fontWeight: 500,
            }}
          >
            Built for Indian travelers
          </div>
        </div>

        <div
          style={{
            color: '#2563EB',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          xnomadic.com/tools/schengen-calculator/
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
