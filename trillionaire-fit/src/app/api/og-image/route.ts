import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Trillionaire Fit';
    const description = searchParams.get('description') || 'Luxury fashion marketplace';
    const siteName = searchParams.get('siteName') || 'Trillionaire Fit';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(45deg, #f8f9fa 0%, #ffffff 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              maxWidth: '800px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: '20px',
                lineHeight: '1.2',
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#666666',
                  marginBottom: '30px',
                  lineHeight: '1.4',
                }}
              >
                {description}
              </div>
            )}
            <div
              style={{
                fontSize: '20px',
                color: '#999999',
                fontWeight: '500',
              }}
            >
              {siteName}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
