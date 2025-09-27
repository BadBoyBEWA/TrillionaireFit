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

  // CSP
  const scriptSrc = isDev ? "'self' 'unsafe-eval'" : "'self'";
  res.headers.set(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src ${scriptSrc} https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https: https://res.cloudinary.com;
      connect-src 'self' https://api.stripe.com https://res.cloudinary.com https://api.cloudinary.com;
      frame-src 'self' https://js.stripe.com;
      media-src 'self' https://res.cloudinary.com;
    `.replace(/\s{2,}/g, " ") // clean whitespace
  );

  if (isDev) console.log("🔒 CSP headers applied");

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
