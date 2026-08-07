import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getProduct, priceForSize, type Product } from "@/lib/catalog";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/integrations/supabase/client";

export interface CartLine {
  key: string;
  productSlug: string;
  size: string;
  finish: string;
  quantity: number;
  /** epoch ms the line was added — used for the 3-hour cart hold */
  addedAt?: number;
}

/** Items are held in the cart for 3 hours, then released back to stock. */
export const CART_HOLD_HOURS = 3;
const CART_HOLD_MS = CART_HOLD_HOURS * 60 * 60 * 1000;

const isFresh = (l: CartLine) => !l.addedAt || Date.now() - l.addedAt < CART_HOLD_MS;

interface StoreState {
  lines: CartLine[];
  wishlist: string[];
}

type Action =
  | { type: "hydrate"; state: StoreState }
  | { type: "add"; line: Omit<CartLine, "key">; }
  | { type: "purgeExpired" }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "setWishlist"; slugs: string[] }
  | { type: "toggleWishlist"; slug: string };

const STORAGE_KEY = "kyathi-store-v1";
const initialState: StoreState = { lines: [], wishlist: [] };

const lineKey = (l: Omit<CartLine, "key">) => `${l.productSlug}__${l.size}__${l.finish}`;

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "hydrate":
      return { ...action.state, lines: (action.state.lines ?? []).filter(isFresh) };
    case "purgeExpired": {
      const kept = state.lines.filter(isFresh);
      return kept.length === state.lines.length ? state : { ...state, lines: kept };
    }
    case "add": {
      const key = lineKey(action.line);
      const existing = state.lines.find((l) => l.key === key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + action.line.quantity } : l,
          ),
        };
      }
      return {
        ...state,
        lines: [...state.lines, { ...action.line, key, addedAt: action.line.addedAt ?? Date.now() }],
      };
    }
    case "setQty":
      return {
        ...state,
        lines: state.lines
          .map((l) => (l.key === action.key ? { ...l, quantity: action.quantity } : l))
          .filter((l) => l.quantity > 0),
      };
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case "clear":
      return { ...state, lines: [] };
    case "setWishlist":
      return { ...state, wishlist: action.slugs };
    case "toggleWishlist":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug)
          ? state.wishlist.filter((s) => s !== action.slug)
          : [...state.wishlist, action.slug],
      };
    default:
      return state;
  }
}

export interface ResolvedLine extends CartLine {
  product: Product;
  unitPrice: number;
  lineTotal: number;
}

interface StoreContextValue {
  lines: ResolvedLine[];
  wishlist: string[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  addToCart: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  /** epoch ms at which the oldest held line is released, or null when empty */
  cartExpiresAt: number | null;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 149;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const wishlistRef = useRef<string[]>(state.wishlist);
  wishlistRef.current = state.wishlist;

  /** On sign-in: push whatever was saved on this device, then follow the cloud. */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.from("wishlist_items").select("product_slug");
      if (cancelled) return;
      const remote = (data ?? []).map((r) => r.product_slug);
      const missing = wishlistRef.current.filter((s) => !remote.includes(s));
      if (missing.length) {
        await supabase
          .from("wishlist_items")
          .insert(missing.map((slug) => ({ user_id: userId, product_slug: slug })));
      }
      if (cancelled) return;
      dispatch({ type: "setWishlist", slugs: Array.from(new Set([...remote, ...missing])) });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);


  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) as StoreState });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  /** Release held items once the 3-hour window lapses. */
  useEffect(() => {
    const tick = () => dispatch({ type: "purgeExpired" });
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const lines = useMemo<ResolvedLine[]>(() => {
    return state.lines.flatMap((l) => {
      const product = getProduct(l.productSlug);
      if (!product) return [];
      const unitPrice = priceForSize(product, l.size);
      return [{ ...l, product, unitPrice, lineTotal: unitPrice * l.quantity }];
    });
  }, [state.lines]);

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const addToCart = useCallback((line: Omit<CartLine, "key">) => {
    dispatch({ type: "add", line });
  }, []);

  const toggleWishlist = useCallback(
    (slug: string) => {
      const wasSaved = wishlistRef.current.includes(slug);
      dispatch({ type: "toggleWishlist", slug });
      if (!userId) return;
      void (wasSaved
        ? supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_slug", slug)
        : supabase.from("wishlist_items").insert({ user_id: userId, product_slug: slug }));
    },
    [userId],
  );

  const value: StoreContextValue = {
    lines,
    wishlist: state.wishlist,
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    cartOpen,
    setCartOpen,
    searchOpen,
    setSearchOpen,
    addToCart,
    setQuantity: (key, quantity) => dispatch({ type: "setQty", key, quantity }),
    removeLine: (key) => dispatch({ type: "remove", key }),
    clearCart: () => dispatch({ type: "clear" }),
    toggleWishlist,
    isWishlisted: (slug) => state.wishlist.includes(slug),
    cartExpiresAt: state.lines.length
      ? Math.min(...state.lines.map((l) => (l.addedAt ?? Date.now()) + CART_HOLD_MS))
      : null,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
