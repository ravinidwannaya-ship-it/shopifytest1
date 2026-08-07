import { supabase } from "@/integrations/supabase/client";
import {
  AUTH_BRIDGE_MESSAGE,
  buildBridgeUrl,
  type AuthBridgeMessage,
} from "@/lib/auth-bridge";

/**
 * Runs Google sign-in in a popup hosted on the Lovable origin, then installs
 * the returned session on the current (proxied) origin.
 * Must be called from a user gesture so the popup is not blocked.
 */
export async function signInWithGoogleViaBridge(): Promise<void> {
  const popup = window.open(
    buildBridgeUrl(window.location.origin),
    "kyathi-google-signin",
    "width=480,height=680,menubar=no,toolbar=no",
  );
  if (!popup) throw new Error("Please allow pop-ups to sign in with Google.");

  const tokens = await new Promise<AuthBridgeMessage>((resolve, reject) => {
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(closedTimer);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== popup) return;
      const payload = event.data as AuthBridgeMessage | undefined;
      if (!payload || payload.type !== AUTH_BRIDGE_MESSAGE) return;
      cleanup();
      if (payload.ok) resolve(payload);
      else reject(new Error(payload.error ?? "Google sign-in failed"));
    };
    const closedTimer = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Sign-in window was closed before finishing."));
      }
    }, 600);
    window.addEventListener("message", onMessage);
  });

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Google sign-in did not return a session.");
  }
  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error) throw error;
}
