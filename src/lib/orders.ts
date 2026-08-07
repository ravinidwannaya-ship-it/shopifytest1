/**
 * Order records for the confirmation and tracking flow.
 *
 * Persisted to localStorage today. Replace the read/write helpers with API
 * calls when a backend exists — the rest of the app only uses these functions.
 */
import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OrderLine {
  productSlug: string;
  name: string;
  image: string;
  size: string;
  finish: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  placedAt: string;
  status: number;
  paymentMethod: string;
  paymentLabel: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst?: string;
  };
  delivery: { etaLabel: string; minDays: number; maxDays: number; zone: string };
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
}

export const ORDER_STAGES = [
  { title: "Order confirmed", copy: "Payment received and the piece is reserved for you." },
  { title: "In finishing", copy: "Gold coating, anti-tarnish sealing and final quality inspection." },
  { title: "Packed & dispatched", copy: "Foam-moulded, double-boxed and handed to our insured carrier." },
  { title: "Out for delivery", copy: "With the local partner for final-mile delivery." },
  { title: "Delivered", copy: "Signed for at your address." },
];

const STORAGE_KEY = "kyathi-orders-v1";

let orders: Order[] = [];
let hydrated = false;
const listeners = new Set<() => void>();
const EMPTY: Order[] = [];

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    /* storage unavailable */
  }
}

export function hydrateOrders() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Order[];
    if (Array.isArray(parsed)) {
      orders = parsed;
      emit();
    }
  } catch {
    /* corrupt storage */
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOrders(): Order[] {
  return useSyncExternalStore(
    subscribe,
    () => orders,
    () => EMPTY,
  );
}

export function newOrderId(): string {
  return `KY${Math.floor(100000 + Math.random() * 899999)}`;
}

export function saveOrder(order: Order) {
  orders = [order, ...orders.filter((o) => o.id !== order.id)];
  persist();
  emit();
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
}

/** Orders age through the pipeline so tracking shows realistic movement. */
export function currentStage(order: Order): number {
  const hours = (Date.now() - new Date(order.placedAt).getTime()) / 36e5;
  if (hours < 6) return 0;
  if (hours < 24) return 1;
  if (hours < 72) return 2;
  if (hours < 120) return 3;
  return 4;
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/* Cloud sync                                                          */
/* ------------------------------------------------------------------ */

interface OrderRow {
  order_code: string;
  placed_at: string;
  status: string;
  payment_method: string;
  payment_label: string;
  customer: unknown;
  delivery: unknown;
  subtotal: number;
  shipping: number;
  total: number;
  order_items: {
    product_slug: string;
    name: string;
    image: string;
    size: string;
    finish: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
}

function fromRow(row: OrderRow): Order {
  return {
    id: row.order_code,
    placedAt: row.placed_at,
    status: Number(row.status) || 0,
    paymentMethod: row.payment_method,
    paymentLabel: row.payment_label,
    customer: row.customer as Order["customer"],
    delivery: row.delivery as Order["delivery"],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    lines: row.order_items.map((i) => ({
      productSlug: i.product_slug,
      name: i.name,
      image: i.image,
      size: i.size,
      finish: i.finish,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      lineTotal: i.line_total,
    })),
  };
}

/** Replaces the in-memory list with the signed-in customer's cloud orders. */
export async function loadOrdersFromCloud(): Promise<void> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_code, placed_at, status, payment_method, payment_label, customer, delivery, subtotal, shipping, total, order_items(product_slug, name, image, size, finish, quantity, unit_price, line_total)",
    )
    .order("placed_at", { ascending: false });
  if (error || !data) return;
  const remote = (data as unknown as OrderRow[]).map(fromRow);
  const remoteIds = new Set(remote.map((o) => o.id));
  orders = [...remote, ...orders.filter((o) => !remoteIds.has(o.id))];
  persist();
  emit();
}

/** Persists an order against the signed-in customer. */
export async function pushOrderToCloud(order: Order, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_code: order.id,
      placed_at: order.placedAt,
      status: String(order.status),
      payment_method: order.paymentMethod,
      payment_label: order.paymentLabel,
      customer: order.customer,
      delivery: order.delivery,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
    })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("Order could not be saved");

  const { error: itemsError } = await supabase.from("order_items").insert(
    order.lines.map((l) => ({
      order_id: data.id,
      product_slug: l.productSlug,
      name: l.name,
      image: l.image,
      size: l.size,
      finish: l.finish,
      quantity: l.quantity,
      unit_price: l.unitPrice,
      line_total: l.lineTotal,
    })),
  );
  if (itemsError) throw itemsError;
}
