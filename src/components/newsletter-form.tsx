import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmail, STUDIO_EMAIL } from "@/lib/emailjs";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    void sendEmail({
      to: email.trim(),
      subject: "Welcome to Kyathi Insider",
      message:
        "Namaste,\n\nYou're on the Kyathi Insider list. You'll hear first about new castings, limited silver editions and studio openings.\n\n— Kyathi Heritage, Puttur",
    });
    void sendEmail({
      to: STUDIO_EMAIL,
      toName: "Kyathi Studio",
      subject: "New newsletter subscriber",
      message: `New Kyathi Insider signup: ${email.trim()}`,
      replyTo: email.trim(),
    });
    toast.success("Welcome to Kyathi Insider", {
      description: "Look out for early access to new castings.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="min-w-0 bg-background"
      />
      <Button type="submit" size={compact ? "sm" : "default"} className="shrink-0">
        Join
      </Button>
    </form>
  );
}
