import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          color: '#FFFFFF',
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        90
      </div>
    ),
    {
      ...size,
    }
  );
}
