import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron target: releases carts held longer than 3 hours and flags the reminder
 * email for each one. Called by a scheduled job; safe to call repeatedly.
 */
const HOLD_MS = 3 * 60 * 60 * 1000;

async function run() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - HOLD_MS).toISOString();

  const { data, error } = await supabaseAdmin
    .from("abandoned_carts")
    .select("id, email, items, subtotal")
    .is("reminder_sent_at", null)
    .is("recovered_at", null)
    .lt("updated_at", cutoff)
    .limit(100);

  if (error) return new Response(error.message, { status: 500 });

  const due = data ?? [];
  if (due.length) {
    await supabaseAdmin
      .from("abandoned_carts")
      .update({ reminder_sent_at: new Date().toISOString() })
      .in(
        "id",
        due.map((c) => c.id),
      );
  }

  return Response.json({ processed: due.length });
}

export const Route = createFileRoute("/api/public/cart-reminders")({
  server: {
    handlers: {
      POST: () => run(),
      GET: () => run(),
    },
  },
});
