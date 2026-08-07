/**
 * Cross-origin Google sign-in bridge.
 *
 * Lovable's managed OAuth broker only accepts redirect URIs on the project's
 * own domains (`*.lovable.app` and Lovable-connected custom domains). When the
 * storefront is served from a Cloudflare Worker proxy, the browser origin is
 * not on that allow-list, so `/~oauth/initiate` refuses the request.
 *
 * The bridge solves this: the OAuth round-trip happens in a popup on the
 * Lovable origin (which IS allowed), and the resulting session tokens are
 * handed back to the proxy origin over a targeted `postMessage`. The proxy
 * origin then installs the session with `supabase.auth.setSession`, so the
 * shopper stays on the proxy domain with their cart untouched.
 */

/** Canonical Lovable origin that owns the OAuth allow-list entry. */
export const LOVABLE_AUTH_ORIGIN = "https://kyathi.lovable.app";

/** Path of the popup page that performs the OAuth round-trip. */
export const AUTH_BRIDGE_PATH = "/auth/bridge";

/**
 * Origins allowed to receive session tokens from the bridge.
 * Only add origins you control — anything listed here can sign users in.
 */
export const ALLOWED_BRIDGE_ORIGINS = [
  "https://kyathi.optimaaya.workers.dev",
] as const;

export const AUTH_BRIDGE_MESSAGE = "kyathi:auth-bridge";

export interface AuthBridgeMessage {
  type: typeof AUTH_BRIDGE_MESSAGE;
  ok: boolean;
  access_token?: string;
  refresh_token?: string;
  error?: string;
}

/** True when the current page is served by Lovable hosting itself. */
export function isLovableHost(host = window.location.hostname): boolean {
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

/** True when the current origin needs the popup bridge to sign in with Google. */
export function needsAuthBridge(origin = window.location.origin): boolean {
  return (ALLOWED_BRIDGE_ORIGINS as readonly string[]).includes(origin);
}

export function isAllowedBridgeOrigin(origin: string | null): origin is string {
  return !!origin && (ALLOWED_BRIDGE_ORIGINS as readonly string[]).includes(origin);
}

export function buildBridgeUrl(origin: string): string {
  return `${LOVABLE_AUTH_ORIGIN}${AUTH_BRIDGE_PATH}?origin=${encodeURIComponent(origin)}`;
}
