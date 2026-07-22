import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ADMIN_GETS = new Set(["/api/admin/settings", "/api/admin/schedule"]);
const PUBLIC_ADMIN_POSTS = new Set(["/api/admin/seed"]);

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });
  const isAdmin = token?.role === "admin";

  if (path.startsWith("/admin") && !isAdmin) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/api/admin")) {
    const isPublicGet = PUBLIC_ADMIN_GETS.has(path) && req.method === "GET";
    const isPublicPost = PUBLIC_ADMIN_POSTS.has(path) && req.method === "POST";
    if (!isPublicGet && !isPublicPost && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (path.startsWith("/api/screening/pdf") && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/screening/pdf/:path*"],
};
