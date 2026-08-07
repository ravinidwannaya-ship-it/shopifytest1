import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  AUTH_BRIDGE_MESSAGE,
  AUTH_BRIDGE_PATH,
  LOVABLE_AUTH_ORIGIN,
  isAllowedBridgeOrigin,
  type AuthBridgeMessage,
} from "@/lib/auth-bridge";

const STORAGE_KEY = "kyathi:bridge-origin";

export const Route = createFileRoute("/auth_/bridge")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in · Kyathi Heritage" },
      {
        name: "description",
        content:
          "Secure Google sign-in step for the Kyathi Heritage store. This window closes automatically.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthBridge,
});

function AuthBridge() {
  const [message, setMessage] = useState("Connecting to Google…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get("origin");
    if (isAllowedBridgeOrigin(incoming)) {
      window.sessionStorage.setItem(STORAGE_KEY, incoming);
    }
    const target = window.sessionStorage.getItem(STORAGE_KEY);

    const finish = (payload: AuthBridgeMessage) => {
      if (isAllowedBridgeOrigin(target) && window.opener) {
        window.opener.postMessage(payload, target);
        window.sessionStorage.removeItem(STORAGE_KEY);
        window.close();
        return;
      }
      setMessage(payload.ok ? "Signed in. You can close this window." : (payload.error ?? "Sign-in failed."));
    };

    if (!isAllowedBridgeOrigin(target)) {
      setMessage("This sign-in link is not valid for this site.");
      return;
    }

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        finish({
          type: AUTH_BRIDGE_MESSAGE,
          ok: true,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        return;
      }
      try {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: `${LOVABLE_AUTH_ORIGIN}${AUTH_BRIDGE_PATH}`,
        });
        if (result?.error) throw result.error;
        if (result?.redirected) return;
        const { data: after } = await supabase.auth.getSession();
        if (!after.session) throw new Error("No session returned");
        finish({
          type: AUTH_BRIDGE_MESSAGE,
          ok: true,
          access_token: after.session.access_token,
          refresh_token: after.session.refresh_token,
        });
      } catch (error) {
        finish({
          type: AUTH_BRIDGE_MESSAGE,
          ok: false,
          error: error instanceof Error ? error.message : "Google sign-in failed",
        });
      }
    })();
  }, []);

  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div className="grid gap-3">
        <p className="eyebrow">Kyathi Heritage</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
