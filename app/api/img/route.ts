import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/img?url=<encoded-image-url>
 *
 * Server-side image proxy.
 *
 * ALL known CDN hostnames are relayed through the backend server at
 * 174.165.78.29:8090/api/img-proxy because:
 *
 *  - files.qatarliving.com   — no public DNS; only resolves inside Qatar
 *  - content.mzadqatar.com   — Cloudflare-protected; returns 403 from Vercel
 *
 * The backend server is Qatar-hosted and can reach both CDNs directly.
 *
 * Security: only proxies images from known allowed origins.
 */

const BACKEND = "http://174.165.78.29:8090";

const ALLOWED_ORIGINS = [
  "content.mzadqatar.com",
  "files.qatarliving.com",
  "images.qatarliving.com",
  "174.165.78.29",
];

function isAllowed(urlStr: string): boolean {
  try {
    const { hostname } = new URL(urlStr);
    return ALLOWED_ORIGINS.some(
      (o) => hostname === o || hostname.endsWith(`.${o}`)
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url param", { status: 400 });
  }

  if (!isAllowed(url)) {
    return new NextResponse("Origin not allowed", { status: 403 });
  }

  // Always relay through the backend — it's Qatar-hosted and can reach both
  // content.mzadqatar.com and files.qatarliving.com directly.
  const fetchUrl = `${BACKEND}/api/img-proxy?url=${encodeURIComponent(url)}`;

  try {
    const upstream = await fetch(fetchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MzadCarsBot/1.0)" },
      cache: "force-cache",
    });

    if (!upstream.ok) {
      return new NextResponse(`Upstream error ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[img-proxy] fetch failed", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}
