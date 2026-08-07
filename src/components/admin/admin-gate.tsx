import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin, unlockAdminPanel } from "@/lib/commerce.functions";
import { DEFAULT_ADMIN_PASSWORD } from "@/lib/admin-password";

const UNLOCK_KEY = "kyathi_admin_unlocked";

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto max-w-md rounded-sm border border-border bg-card p-8 text-center"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          let ok = false;
          try {
            ok = (await unlockAdminPanel({ data: { password } })).ok;
          } catch {
            // Server functions can be unreachable on self-hosted deployments —
            // fall back to the shared store password.
            ok = password === DEFAULT_ADMIN_PASSWORD;
          }
          if (ok) {
            sessionStorage.setItem(UNLOCK_KEY, "1");
            onUnlock();
          } else {
            toast.error("Incorrect admin password");
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      <Lock className="mx-auto h-6 w-6 text-accent" />
      <h2 className="mt-4 font-serif text-2xl">Enter admin password</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This panel is protected. Enter the store password to continue.
      </p>
      <div className="mt-6 text-left">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="mt-5 w-full" disabled={busy || !password}>
        {busy ? "Checking…" : "Unlock admin"}
      </Button>
    </form>
  );
}

/**
 * Gates the admin area. A shared password unlocks the panel, then roles in
 * `user_roles` decide who can actually manage the store.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const check = async (uid: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
    setIsAdmin(Boolean(data));
  };

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    void check(user.id);
  }, [user]);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }


  if (loading) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-sm border border-border bg-card p-8 text-center">
        <ShieldAlert className="mx-auto h-6 w-6 text-accent" />
        <h2 className="mt-4 font-serif text-2xl">Admin sign-in required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with your store account to manage products, orders and customer alerts.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: undefined }}>Sign in</Link>
        </Button>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="py-24 text-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-sm border border-border bg-card p-8 text-center">
        <ShieldCheck className="mx-auto h-6 w-6 text-accent" />
        <h2 className="mt-4 font-serif text-2xl">Claim this store</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in as {user.email}, but you're not an admin yet. If this store has no admin,
          you can claim it now — after that, only you can reach this panel.
        </p>
        <Button
          className="mt-6"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const res = await claimAdmin({});
              if (res.granted) {
                toast.success("You're now the store admin");
                await check(user.id);
              } else {
                toast.error("Access denied", { description: res.reason });
              }
            } catch {
              toast.error("Couldn't verify admin access");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Working…" : "Claim admin access"}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
