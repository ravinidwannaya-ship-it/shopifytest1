import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/page-hero";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search['redirect'] === "string" ? (search['redirect'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Kyathi" },
      {
        name: "description",
        content:
          "Sign in to Kyathi to sync your wishlist, saved addresses and order history across devices.",
      },
      { property: "og:title", content: "Sign in — Kyathi" },
      {
        property: "og:description",
        content: "Sign in with Google or email to access your Kyathi account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function safePath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

function AuthPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const destination = safePath(search.redirect);

  useEffect(() => {
    if (!loading && user) navigate({ to: destination, replace: true });
  }, [user, loading, destination, navigate]);

  const onGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      toast.error("Google sign-in could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await signInWithEmail(
      String(form.get("email") ?? ""),
      String(form.get("password") ?? ""),
    );
    setBusy(false);
    if (error) toast.error(error);
    else toast.success("Welcome back");
  };

  const onSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error, needsConfirmation } = await signUpWithEmail(
      String(form.get("email") ?? ""),
      String(form.get("password") ?? ""),
      String(form.get("fullName") ?? ""),
    );
    setBusy(false);
    if (error) toast.error(error);
    else if (needsConfirmation)
      toast.success("Check your email", {
        description: "Confirm your address to finish creating your account.",
      });
  };

  return (
    <>
      <PageHero
        eyebrow="Kyathi account"
        title="Sign in"
        copy="Your wishlist, saved addresses and orders, wherever you shop from."
      />

      <Section>
        <div className="mx-auto w-full max-w-md">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3"
            disabled={busy}
            onClick={onGoogle}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="my-7 flex items-center gap-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={onSignIn} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="si-password">Password</Label>
                  <Input
                    id="si-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" size="lg" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={onSignUp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" name="fullName" required autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="su-password">Password</Label>
                  <Input
                    id="su-password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" size="lg" disabled={busy}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to Kyathi's terms of service and privacy policy.
          </p>
        </div>
      </Section>
    </>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}
