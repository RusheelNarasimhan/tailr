/** Safe post-auth paths (open redirect protection). */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return "/app";

  const decoded = decodeURIComponent(raw).trim();
  const [pathname, query] = decoded.split("?");

  if (pathname === "/auth/update-password") {
    return "/auth/update-password";
  }

  if (pathname !== "/app") return "/app";

  if (query?.includes("checkout=true")) return "/app?checkout=true";
  return "/app";
}

export function getRedirectPathFromSearchParams(
  searchParams: URLSearchParams,
): string {
  const next = searchParams.get("next");
  if (next) return safeNextPath(next);
  if (searchParams.get("intent") === "upgrade") return "/app?checkout=true";
  return "/app";
}

export function buildAuthCallbackUrl(
  origin: string,
  nextPath: string,
): string {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

export function applyNextPathToUrl(base: URL, nextPath: string): URL {
  const [pathname, query] = nextPath.split("?");
  base.pathname = pathname;
  base.search = "";
  if (query) {
    query.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) base.searchParams.set(key, value ?? "");
    });
  }
  return base;
}
