import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_ADMIN_PASSWORD } from "@/lib/admin-password";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AbandonedCartItem {
  slug: string;
  name: string;
  size: string;
  finish: string;
  quantity: number;
  unitPrice: number;
}

interface SaveCartInput {
  email: string;
  items: AbandonedCartItem[];
  subtotal: number;
}

const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;

/**
 * Public: remembers a cart against an email so the 3-hour reminder job can
 * mail the shopper. Writes with the service-role client after validation.
 */
export const saveAbandonedCart = createServerFn({ method: "POST" })
  .inputValidator((input: SaveCartInput) => {
    if (!isEmail(input?.email)) throw new Error("A valid email is required");
    const items = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
    return {
      email: input.email.trim().toLowerCase(),
      items,
      subtotal: Number.isFinite(input.subtotal) ? Math.max(0, Math.round(input.subtotal)) : 0,
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("abandoned_carts").upsert(
      {
        email: data.email,
        items: data.items as unknown as never,
        subtotal: data.subtotal,
        reminder_sent_at: null,
        recovered_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Public: called after checkout so a recovered cart stops reminding. */
export const clearAbandonedCart = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => {
    if (!isEmail(input?.email)) throw new Error("A valid email is required");
    return { email: input.email.trim().toLowerCase() };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("abandoned_carts")
      .update({ recovered_at: new Date().toISOString() })
      .eq("email", data.email);
    return { ok: true };
  });

/**
 * Bootstrap: the first signed-in person to ask becomes the store admin.
 * Once an admin exists this is a no-op for everyone else.
 */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false as const, reason: "An admin already exists" };
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { granted: true as const, reason: "" };
  });

/** Verifies the shared admin-panel password on the server. */
export const unlockAdminPanel = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: typeof data?.password === "string" ? data.password.slice(0, 200) : "",
  }))
  .handler(async ({ data }) => {
    const { createHash, timingSafeEqual } = await import("node:crypto");
    // Falls back to the shared store password so the panel also works on
    // self-hosted deployments (Cloudflare Workers) where the secret is unset.
    const expected = process.env["ADMIN_PANEL_PASSWORD"] || DEFAULT_ADMIN_PASSWORD;
    const a = createHash("sha256").update(data.password, "utf8").digest();
    const b = createHash("sha256").update(expected, "utf8").digest();
    return { ok: timingSafeEqual(a, b) };
  });
