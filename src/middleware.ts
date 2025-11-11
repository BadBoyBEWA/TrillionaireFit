// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const isDev = process.env.NODE_ENV === "development";

  // Security headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // CSP (allow inline scripts via 'unsafe-inline')
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://embed.tawk.to https://*.tawk.to"
    : "'self' 'unsafe-inline' https://js.stripe.com https://embed.tawk.to https://*.tawk.to";

  // Allow Tawk.to stylesheets
  const styleSrc = "'self' 'unsafe-inline' https://embed.tawk.to https://*.tawk.to";

  // Allow Tawk.to API connections (including websockets)
  const connectSrc =
    "'self' https://api.stripe.com https://res.cloudinary.com https://embed.tawk.to https://*.tawk.to https://tawk.to wss://embed.tawk.to wss://*.tawk.to";

  res.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; img-src 'self' data: blob: https:; connect-src ${connectSrc}; frame-src 'self' https://js.stripe.com https://embed.tawk.to https://*.tawk.to https://tawk.to; font-src 'self' data: https://embed.tawk.to https://*.tawk.to;`
  );

  if (isDev) console.log("🔒 CSP headers (with unsafe-inline) applied");

  return res;
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
