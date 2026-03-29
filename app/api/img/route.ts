import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/img?url=<encoded-image-url>
 *
 * Server-side image proxy.  Fetches the remote image WITHOUT a Referer header
 * so CDNs with hotlink-protection (content.mzadqatar.com, files.qatarliving.com)
 * respond with 200 instead of 403.
 *
 * Security: only proxies images from our known allowed origins.
 */

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

  try {
    // Fetch without Referer — the key that bypasses hotlink protection
    const upstream = await fetch(url, {
      headers: {
        // Mimic a direct browser visit with no referrer
        "User-Agent":
          "Mozilla/5.0 (compatible; MzadCarsBot/1.0)",
      },
      // Don't forward any cache signals from the client
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
        // Cache aggressively at the CDN/browser level
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[img-proxy] fetch failed", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}
