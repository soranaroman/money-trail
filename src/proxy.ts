// Gate HTTP Basic Auth — promptul nativ user+parolă din browser, pe orice plan Vercel.
// Se activează DOAR când BASIC_AUTH_USER + BASIC_AUTH_PASSWORD sunt setate (pe Vercel).
// Local (`npm run dev`) variabilele lipsesc → demo-ul rămâne deschis, fără login.
// Parola NU stă în cod (repo public) — trăiește ca variabilă de mediu.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Comparație în timp constant — nu scurgem potrivirea prin timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Autentificare necesară.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="MoneyTrail", charset="UTF-8"' },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASSWORD;

  // Necredențializat = gate oprit (dev local, sau Vercel fără env setate).
  if (!user || !pass) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      if (sep !== -1) {
        const u = decoded.slice(0, sep);
        const p = decoded.slice(sep + 1);
        if (safeEqual(u, user) && safeEqual(p, pass)) return NextResponse.next();
      }
    } catch {
      /* header base64 invalid → cade în unauthorized */
    }
  }
  return unauthorized();
}

export const config = {
  // Tot, mai puțin asseturile statice (login-ul acoperă oricum tot originul o dată intrat).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
