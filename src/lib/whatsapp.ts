import type { Order } from "./orders";
import { formatINR } from "./catalog";

/** Store WhatsApp number in international format, digits only. */
export const STORE_WHATSAPP = "919900107659";

export function normalisePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export function orderConfirmationMessage(order: Order) {
  const items = order.lines
    .map((l) => `• ${l.name} (${l.size}) × ${l.quantity} — ${formatINR(l.lineTotal)}`)
    .join("\n");

  return [
    `*Kyathi — order confirmed* 🙏`,
    ``,
    `Order ID: ${order.id}`,
    `Name: ${order.customer.fullName}`,
    ``,
    items,
    ``,
    `Subtotal: ${formatINR(order.subtotal)}`,
    `Shipping: ${order.shipping === 0 ? "Free" : formatINR(order.shipping)}`,
    `Total: ${formatINR(order.total)}`,
    `Payment: ${order.paymentLabel}`,
    ``,
    `Delivering to: ${order.customer.address}, ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}`,
    `Estimated delivery: ${order.delivery.etaLabel}`,
  ].join("\n");
}

/** Deep link that sends the confirmation to the customer's own WhatsApp number. */
export function customerConfirmationLink(order: Order) {
  const phone = normalisePhone(order.customer.phone);
  const text = encodeURIComponent(orderConfirmationMessage(order));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

/** Deep link that notifies the Kyathi studio owner about a new order. */
export function studioNotifyLink(order: Order) {
  const text = encodeURIComponent(
    `*New Kyathi order received* 🛎️\n\n${orderConfirmationMessage(order)}\n\nCustomer phone: ${order.customer.phone}\nCustomer email: ${order.customer.email}`,
  );
  return `https://wa.me/${STORE_WHATSAPP}?text=${text}`;
}

/** Opens both WhatsApp deep links, falling back to a click when popups are blocked. */
export function openWhatsAppLinks(links: string[]) {
  links.forEach((href, i) => {
    window.setTimeout(() => {
      const win = window.open(href, "_blank", "noopener,noreferrer");
      if (!win) {
        const a = document.createElement("a");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }, i * 400);
  });
}
