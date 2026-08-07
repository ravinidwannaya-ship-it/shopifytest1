import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Lock, RotateCcw, Truck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { formatINR } from "@/lib/catalog";
import { checkPincode } from "@/lib/delivery";
import { newOrderId, pushOrderToCloud, saveOrder, type Order } from "@/lib/orders";
import { clearAbandonedCart } from "@/lib/commerce.functions";
import { UpiPayment } from "@/components/upi-payment";
import { customerConfirmationLink, openWhatsAppLinks, orderConfirmationMessage, studioNotifyLink } from "@/lib/whatsapp";
import { sendEmail, STUDIO_EMAIL } from "@/lib/emailjs";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Kyathi" },
      { name: "description", content: "Secure checkout for your Kyathi sculpture order." },
      { property: "og:title", content: "Checkout — Kyathi" },
      { property: "og:description", content: "Card, UPI, net banking or cash on delivery." },
    ],
  }),
  component: CheckoutPage,
});

const PAYMENTS = [
  { value: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay" },
  { value: "upi", label: "UPI", hint: "Scan the Kyathi QR or pay to our UPI ID" },
  { value: "netbanking", label: "Net Banking", hint: "All major Indian banks" },
  { value: "cod", label: "Cash on Delivery", hint: "Available under ₹25,000" },
];

function CheckoutPage() {
  const { lines, subtotal, shipping, total, clearCart } = useStore();
  const { user, profile, addresses } = useAuth();
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const navigate = useNavigate();
  const [payment, setPayment] = useState("upi");
  const [pincode, setPincode] = useState("");
  const [upiReference, setUpiReference] = useState("");

  useEffect(() => {
    if (defaultAddress?.pincode) setPincode(defaultAddress.pincode);
  }, [defaultAddress?.pincode]);

  const estimate = useMemo(() => checkPincode(pincode), [pincode]);
  const codBlocked = payment === "cod" && estimate ? !estimate.codAvailable : false;

  const placeOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();

    const delivery = checkPincode(value("pincode"));
    if (!delivery) {
      toast.error("Enter a valid 6-digit delivery pincode");
      return;
    }
    if (!delivery.serviceable) {
      toast.error("We can't deliver to that pincode yet", { description: delivery.message });
      return;
    }
    if (payment === "upi" && upiReference.trim().length < 6) {
      toast.error("Add your UPI reference number", {
        description: "Pay via the QR or UPI ID above, then paste the UTR from your payment app.",
      });
      return;
    }
    if (payment === "cod" && !delivery.codAvailable) {
      toast.error("Cash on delivery isn't available on this lane", {
        description: "Choose UPI, card or net banking to continue.",
      });
      return;
    }

    const id = newOrderId();
    const order: Order = {
      id,
      placedAt: new Date().toISOString(),
      status: 0,
      paymentMethod: payment,
      paymentLabel:
        payment === "upi"
          ? `UPI · Ref ${upiReference.trim()}`
          : (PAYMENTS.find((p) => p.value === payment)?.label ?? payment),
      customer: {
        fullName: value("fullName"),
        email: value("email"),
        phone: value("phone"),
        address: value("address"),
        city: value("city"),
        state: value("state"),
        pincode: delivery.pincode,
        gst: value("gst"),
      },
      delivery: {
        etaLabel: delivery.etaLabel,
        minDays: delivery.minDays,
        maxDays: delivery.maxDays,
        zone: `${delivery.zone} · ${delivery.city}`,
      },
      lines: lines.map((l) => ({
        productSlug: l.productSlug,
        name: l.product.name,
        image: l.product.images[0] ?? "",
        size: l.size,
        finish: l.finish,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      subtotal,
      shipping,
      total,
    };

    saveOrder(order);
    if (user) {
      try {
        await pushOrderToCloud(order, user.id);
      } catch {
        toast.error("Order placed, but it couldn't sync to your account.");
      }
    }
    if (order.customer.email) {
      try {
        await clearAbandonedCart({ data: { email: order.customer.email } });
      } catch {
        /* reminder cleanup is best-effort */
      }
    }
    // Send the confirmation to the customer's WhatsApp and alert the owner.
    openWhatsAppLinks([studioNotifyLink(order), customerConfirmationLink(order)]);
    // Email the same confirmation to the shopper and a copy to the studio.
    const orderBody = orderConfirmationMessage(order).replace(/\*/g, "");
    if (order.customer.email) {
      void sendEmail({
        to: order.customer.email,
        toName: order.customer.fullName,
        subject: `Your Kyathi order ${order.id} is confirmed`,
        message: `Namaste ${order.customer.fullName},\n\nThank you for your order. Here are the details:\n\n${orderBody}\n\nWe'll message you on WhatsApp as your piece moves through packing and dispatch.\n\n— Kyathi Heritage, Puttur`,
      });
    }
    void sendEmail({
      to: STUDIO_EMAIL,
      toName: "Kyathi Studio",
      subject: `New order ${order.id} — ${order.customer.fullName}`,
      message: `${orderBody}\n\nCustomer phone: ${order.customer.phone}\nCustomer email: ${order.customer.email}`,
      replyTo: order.customer.email || undefined,
    });

    clearCart();
    navigate({ to: "/order/$id", params: { id } });
  };


  if (lines.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link to="/collections/$slug" params={{ slug: "gold-coated-silver" }}>
            Browse sculptures
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow="Step 2 of 2" title="Checkout" />

      <form
        key={defaultAddress?.id ?? "guest"}
        onSubmit={placeOrder}
        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:px-8"
      >
        <div className="min-w-0 grid gap-10">
          <section>
            <h2 className="font-serif text-2xl">Shipping address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                id="fullName"
                label="Full name"
                required
                defaultValue={defaultAddress?.full_name ?? profile?.full_name ?? ""}
              />
              <Field
                id="phone"
                label="Phone"
                type="tel"
                required
                defaultValue={defaultAddress?.phone ?? profile?.phone ?? ""}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                required
                className="sm:col-span-2"
                defaultValue={profile?.email ?? user?.email ?? ""}
              />
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  required
                  rows={3}
                  placeholder="Flat, street, landmark"
                  defaultValue={defaultAddress?.line1 ?? ""}
                />
              </div>
              <Field id="city" label="City" required defaultValue={defaultAddress?.city ?? ""} />
              <Field id="state" label="State" required defaultValue={defaultAddress?.state ?? ""} />
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <Field id="gst" label="GSTIN (optional)" />
              {estimate ? (
                <p
                  className={`sm:col-span-2 flex items-start gap-2 rounded-sm border p-3 text-xs leading-relaxed ${
                    estimate.serviceable
                      ? "border-accent/40 bg-accent/5 text-muted-foreground"
                      : "border-destructive/40 bg-destructive/5 text-destructive"
                  }`}
                >
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>
                    {estimate.serviceable
                      ? `${estimate.zone} · delivers by ${estimate.etaLabel}. ${estimate.message}`
                      : estimate.message}
                  </span>
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Payment method</h2>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-5 grid gap-3">
              {PAYMENTS.map((p) => (
                <Label
                  key={p.value}
                  htmlFor={`pay-${p.value}`}
                  className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-sm border border-border p-4 transition-colors has-[button[data-state=checked]]:border-accent"
                >
                  <RadioGroupItem value={p.value} id={`pay-${p.value}`} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{p.label}</span>
                    <span className="block text-xs text-muted-foreground">{p.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>

            {payment === "upi" ? (
              <UpiPayment
                amount={total}
                reference={upiReference}
                onReferenceChange={setUpiReference}
              />
            ) : null}

            <ul className="mt-5 flex flex-wrap gap-5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-accent" /> 256-bit secure payment
              </li>
              <li className="flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-accent" /> 10-day returns
              </li>
              <li className="flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-accent" /> Certified authentic
              </li>
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-sm border border-border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl">Order summary</h2>
          <ul className="mt-5 grid gap-4">
            {lines.map((l) => (
              <li key={l.key} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3">
                <img
                  src={l.product.images[0]}
                  alt=""
                  className="h-14 w-12 rounded-xs object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{l.product.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {l.size} × {l.quantity}
                  </span>
                </span>
                <span className="shrink-0 text-sm">{formatINR(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid gap-2.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            disabled={(estimate ? !estimate.serviceable : false) || codBlocked}
          >
            Place order
          </Button>
          {codBlocked ? (
            <p className="mt-3 text-xs text-destructive">
              Cash on delivery isn't available for this pincode.
            </p>
          ) : null}
        </aside>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
  className,
  inputMode,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  inputMode?: "numeric" | "text" | "tel";
  defaultValue?: string;
}) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        required={required}
        inputMode={inputMode}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}
