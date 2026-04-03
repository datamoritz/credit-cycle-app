import { NextResponse } from "next/server";
import { auth } from "./auth";

export const proxy = auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: [
    // Protect everything except NextAuth routes, the login page, and static assets
    "/((?!api/auth|login|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
