import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emailjsSettings, emailjsConfigured } from "@/lib/emailjs-config";
import { sendEmail, STUDIO_EMAIL } from "@/lib/emailjs";

export const Route = createFileRoute("/admin/email")({
  component: AdminEmail,
});

function AdminEmail() {
  const [to, setTo] = useState(STUDIO_EMAIL);
  const [subject, setSubject] = useState("Kyathi — EmailJS test");
  const [message, setMessage] = useState(
    "This is a test email sent from the Kyathi admin panel using the current EmailJS settings.",
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; at: string }>(null);

  const settings = [
    ["Service ID", emailjsSettings.serviceId],
    ["Template ID", emailjsSettings.templateId],
    ["Public key", emailjsSettings.publicKey],
    ["Studio inbox", emailjsSettings.studioEmail],
    ["From name", emailjsSettings.fromName],
    ["To-email variable", `{{${emailjsSettings.variables.toEmail}}}`],
    ["To-name variable", `{{${emailjsSettings.variables.toName}}}`],
    ["Subject variable", `{{${emailjsSettings.variables.subject}}}`],
    ["Message variable", `{{${emailjsSettings.variables.message}}}`],
    ["Reply-to variable", `{{${emailjsSettings.variables.replyTo}}}`],
  ] as const;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailjsConfigured()) {
      toast.error("EmailJS isn't configured");
      return;
    }
    setSending(true);
    const ok = await sendEmail({
      to: to.trim(),
      toName: to.trim(),
      subject: subject.trim(),
      message,
      replyTo: STUDIO_EMAIL,
    });
    setSending(false);
    setResult({ ok, at: new Date().toLocaleTimeString("en-IN") });
    if (ok) toast.success("EmailJS accepted the send (200 OK)");
    else toast.error("Send failed — check the browser console for the EmailJS error");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={submit} className="space-y-5 rounded-lg border border-border p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-primary" /> Send a test email
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Uses the live environment settings — exactly the same path as order confirmations and
            enquiry mails.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-to">To email</Label>
          <Input
            id="test-to"
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-subject">Subject</Label>
          <Input
            id="test-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-message">Message</Label>
          <Textarea
            id="test-message"
            rows={6}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={sending}>
          <Send className="mr-2 h-4 w-4" />
          {sending ? "Sending…" : "Send test email"}
        </Button>

        {result ? (
          <p className={`text-sm ${result.ok ? "text-primary" : "text-destructive"}`}>
            {result.ok
              ? `EmailJS accepted the message at ${result.at}. If it doesn't arrive, the template's "To email" field isn't using the variable listed on the right.`
              : `Send rejected at ${result.at}. Open the browser console for the exact EmailJS error.`}
          </p>
        ) : null}
      </form>

      <aside className="h-fit rounded-lg border border-border bg-muted/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Current settings
        </h3>
        <dl className="mt-4 space-y-3 text-sm">
          {settings.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="break-all font-mono text-[13px]">{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-xs text-muted-foreground">
          Change any of these with <code>VITE_EMAILJS_*</code> variables in <code>.env</code> — no
          code edits needed.
        </p>
      </aside>
    </div>
  );
}
