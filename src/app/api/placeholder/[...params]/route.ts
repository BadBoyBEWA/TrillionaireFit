import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width = '400', height = '400'] = params.params;
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f4f4f5"/>
      <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#e4e4e7" stroke-width="1"/>
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="16" fill="#71717a" text-anchor="middle" dy=".3em">
        ${width} × ${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
