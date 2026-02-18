import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If authenticated but onboarding not complete, redirect to onboarding
    // (only if not already heading to onboarding)
    if (
      token &&
      !token.onboardingComplete &&
      !pathname.startsWith("/onboarding") &&
      !pathname.startsWith("/api/")
    ) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow onboarding route for authenticated users
        if (req.nextUrl.pathname.startsWith("/onboarding")) {
          return !!token;
        }
        // All protected routes require auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/food-log/:path*",
    "/meal-plan/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
};
