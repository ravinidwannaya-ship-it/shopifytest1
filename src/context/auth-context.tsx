import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { needsAuthBridge } from "@/lib/auth-bridge";
import { signInWithGoogleViaBridge } from "@/lib/auth-bridge-client";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface Address {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  addresses: Address[];
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, "full_name" | "phone">>) => Promise<void>;
  saveAddress: (address: Omit<Address, "id"> & { id?: string }) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadAccount = useCallback(async (userId: string) => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
    ]);
    setProfile((p as Profile | null) ?? null);
    setAddresses((a as Address[] | null) ?? []);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setAddresses([]);
      return;
    }
    void loadAccount(user.id);
  }, [user, loadAccount]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      addresses,
      loading,
      signInWithGoogle: async () => {
        // On a Cloudflare-proxied origin the managed broker rejects our
        // redirect_uri, so the OAuth round-trip runs in a popup on the Lovable
        // origin and the session is handed back here. See src/lib/auth-bridge.ts.
        if (needsAuthBridge()) {
          await signInWithGoogleViaBridge();
          return;
        }
        // Managed Google sign-in — works on lovable.app and custom domains.
        // Direct Supabase OAuth is not used because the provider runs on
        // managed credentials (no per-project OAuth secret).
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result?.error) throw result.error;
      },
      signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUpWithEmail: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        return {
          error: error?.message ?? null,
          needsConfirmation: !error && !data.session,
        };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setAddresses([]);
      },
      refreshProfile: async () => {
        if (user) await loadAccount(user.id);
      },
      updateProfile: async (patch) => {
        if (!user) return;
        await supabase.from("profiles").update(patch).eq("id", user.id);
        await loadAccount(user.id);
      },
      saveAddress: async (address) => {
        if (!user) return;
        const { id, ...rest } = address;
        if (rest.is_default) {
          await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
        }
        if (id) {
          await supabase.from("addresses").update(rest).eq("id", id);
        } else {
          await supabase.from("addresses").insert({ ...rest, user_id: user.id });
        }
        await loadAccount(user.id);
      },
      deleteAddress: async (id) => {
        if (!user) return;
        await supabase.from("addresses").delete().eq("id", id);
        await loadAccount(user.id);
      },
    }),
    [user, session, profile, addresses, loading, loadAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
