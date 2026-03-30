import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Helper function to normalize paths
const normalizePath = (path) => {
  if (!path || path === "/") return "/";
  // Remove trailing slash and ensure leading slash
  return "/" + path.replace(/^\/|\/$/g, "");
};

// Helper to check if path matches a route (with locale handling)
const matchesRoute = (path, route, locale) => {
  const normalizedPath = normalizePath(path);
  const normalizedRoute = normalizePath(route);

  // Exact match
  if (normalizedPath === normalizedRoute) return true;

  // Match with locale prefix
  if (normalizedPath === `/${locale}${normalizedRoute}`) return true;

  // Match locale-only path
  if (normalizedRoute === "/" && normalizedPath === `/${locale}`) return true;

  return false;
};

// Middleware entry — combine i18n middleware with complete auth protection
export default function middleware(req) {
  const { nextUrl, cookies } = req;
  const pathname = nextUrl.pathname;
  const knownLocales = routing.locales || ["en", "ar"];

  // Get auth token from cookie
  const authToken = cookies.get("auth_token")?.value;
  const userType = cookies.get("user_type")?.value;

  // Parse route: extract locale prefix and route without locale
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0] || "";
  const hasLocalePrefix = knownLocales.includes(first);
  const locale = hasLocalePrefix ? first : knownLocales[0];
  const routeWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}` || "/"
    : pathname;

  // Normalize for consistent comparison
  const normalizedRouteWithoutLocale = normalizePath(routeWithoutLocale);
  const normalizedPathname = normalizePath(pathname);

  // Define route categories
  const authRestrictedRoutes = [
    "/artist/signin",
    "/artist/signup",
    "/signin",
    "/signup",
    "/forgot-password",
  ];

  const publicRoutes = [
    "/",
    "/home",
    "/artist/signin",
    "/artist/signup",
    "/signin",
    "/signup",
    "/forgot-password",
    "/all-artists", // Added if this should be public
  ];

  // ====================================
  // RULE 1: Redirect authenticated users away from public/auth pages
  // ====================================
  if (authToken) {
    const isAuthPage = authRestrictedRoutes.some((route) =>
      matchesRoute(pathname, route, locale)
    );

    // Check for root or locale-only
    const isRootOrLocaleOnly =
      normalizedPathname === "/" ||
      (segments.length === 1 && knownLocales.includes(segments[0]));

    if (isAuthPage || isRootOrLocaleOnly) {
      const normalizedUserType = userType?.toLowerCase();
      const homePath =
        normalizedUserType === "artist" ? "/artist-home" : "/home";

      // Preserve the locale prefix style from original request
      const redirectPath = hasLocalePrefix ? `/${locale}${homePath}` : homePath;

      const dest = req.nextUrl.clone();
      dest.pathname = redirectPath;
      return NextResponse.redirect(dest);
    }
  }

  // ====================================
  // RULE 2: Redirect unauthenticated users trying to access protected routes
  // ====================================
  if (!authToken) {
    const isPublicRoute = publicRoutes.some(
      (route) =>
        matchesRoute(pathname, route, locale) ||
        normalizedRouteWithoutLocale === normalizePath(route)
    );

    if (!isPublicRoute) {
      // Check if this is an artist route
      const normalizedPath = normalizedRouteWithoutLocale;
      const isArtistRoute = normalizedPath.startsWith("/artist");

      const signinPath = isArtistRoute ? "/artist/signin" : "/signin";
      const returnUrl = encodeURIComponent(req.nextUrl.href);

      // Use locale prefix if it was in original request
      const redirectPath = hasLocalePrefix
        ? `/${locale}${signinPath}`
        : signinPath;

      const dest = req.nextUrl.clone();
      dest.pathname = redirectPath;
      dest.searchParams.set("returnUrl", returnUrl);
      return NextResponse.redirect(dest);
    }
  }

  // ====================================
  // RULE 3: Role-based routing
  // ====================================
  if (authToken && userType) {
    const normalizedUserType = userType.toLowerCase();
    const normalizedPath = normalizedRouteWithoutLocale;

    // Special case for artists
    if (
      normalizedUserType === "artist" &&
      (normalizedPath === "/home" || normalizedPath === "/all-artists")
    ) {
      const dest = req.nextUrl.clone();
      dest.pathname = hasLocalePrefix
        ? `/${locale}/artist-home`
        : "/artist-home";
      return NextResponse.redirect(dest);
    }

    // Check if this is an artist route
    const isArtistRoute = normalizedPath.startsWith("/artist");

    // Check if this is a public route
    const isPublicRoute = publicRoutes.some(
      (route) => normalizedPath === normalizePath(route)
    );

    const isUserRoute = !isArtistRoute && !isPublicRoute;

    // Artist trying to access user routes
    if (normalizedUserType === "artist" && isUserRoute) {
      const dest = req.nextUrl.clone();
      dest.pathname = hasLocalePrefix
        ? `/${locale}/artist-home`
        : "/artist-home";
      return NextResponse.redirect(dest);
    }

    // User trying to access artist routes
    if (normalizedUserType === "customer" && isArtistRoute && !isPublicRoute) {
      const dest = req.nextUrl.clone();
      dest.pathname = hasLocalePrefix ? `/${locale}/home` : "/home";
      return NextResponse.redirect(dest);
    }
  }

  // Fallback to the existing i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
