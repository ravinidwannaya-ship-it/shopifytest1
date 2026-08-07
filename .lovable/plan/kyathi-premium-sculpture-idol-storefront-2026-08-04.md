# Kyathi — Premium Sculpture & Idol Storefront

A multi-page React storefront for a handcrafted sculpture brand: warm, earthy, heritage-luxury. Mock product data behind a clean data layer, so a real database can replace it later without touching any UI.

## Brand & design system

- Palette (tokens in `src/styles.css`, oklch): deep maroon/terracotta primary, warm brown, brass/gold accent, cream background, charcoal text. Dark-mode-safe pairs.
- Typography: elegant serif headings (Cormorant Garamond), clean sans body (Karla), loaded via `<link>` in the root route.
- Motion: restrained fade/rise on section enter, image scale on card hover, sticky bars sliding in on scroll.

## Pages

1. **Home** (`/`) — announcement bar, header with full nav + search/account/cart, hero carousel (4 slides), Trending horizontal scroll, Most Gifted + New Launches grids, trust bar, Best-Selling Favorites, collection tiles, testimonial carousel, store locator (2 cards), newsletter, 4-column footer.
2. **Collections** (`/collections/$slug`) — one template for every category. Sidebar filters (deity/figure, material, height, price, finish), sort dropdown, product count, responsive grid, skeleton loading.
3. **Product** (`/products/$slug`) — gallery with zoom + thumbnails, title, rating, sale/regular price, size and material/finish variant selectors that change price, quantity, Add to Cart / Buy Now, trust icons, pincode delivery check, Description / Specifications / Shipping tabs, photo reviews, related carousel, sticky add-to-cart bar on scroll.
4. **Custom Sculpture** (`/custom-sculpture`) — hero, enquiry form with reference image upload, 4-step process explainer.
5. **Corporate Gifting** (`/corporate-gifting`) — hero, benefits grid, bulk enquiry form, client logo strip.
6. **About** (`/about`) — brand story + founder quote, four craft-process image/text pairs, values.
7. **Cart** (`/cart`) + **Checkout** (`/checkout`) — cart drawer available site-wide plus a full cart page; checkout with address form, order summary, payment method radios (Card/UPI/Netbanking/COD), trust badges, confirmation state.
8. **Standard pages** — `/contact`, `/faq` (accordion), `/track-order`, `/policies/returns`, `/policies/shipping`, `/policies/terms`, `/policies/privacy`.

## Storewide UX

- Product cards: hover image swap, quick-add, wishlist heart, star rating + review count, scarcity badge ("Only 3 left"), sale/strikethrough price.
- Search overlay with live suggestions filtered from the product catalog.
- Mobile bottom nav (Home, Shop, Cart, Account); mobile drawer menu.
- Floating WhatsApp enquiry button on product pages.
- Skeleton states for grids; toasts for cart/wishlist/form actions.

## Technical approach

- **Data layer:** `src/data/products.ts` (typed `Product`, `Collection`, `Review`, `Testimonial`, `Store` records) accessed only through `src/lib/catalog.ts` — `listProducts({ collection, filters, sort })`, `getProduct(slug)`, `searchProducts(q)`, `listCollections()`. Every page calls these functions, never the raw array, so swapping in Lovable Cloud later is a one-file change.
- **Cart/wishlist state:** React context + reducer in `src/context/store-context.tsx`, persisted to localStorage. Mock checkout — order submits to a local confirmation state.
- **Components** (`src/components/`): `ProductCard`, `ProductGrid`, `CollectionGrid`, `HeroCarousel`, `TestimonialCarousel`, `TrustBar`, `FilterSidebar`, `SortBar`, `RatingStars`, `PriceTag`, `QuantityStepper`, `CartDrawer`, `SearchOverlay`, `Newsletter`, `StoreLocator`, `ProcessSteps`, `EnquiryForm`, `Skeletons`, `SiteHeader`, `SiteFooter`, `MobileBottomNav`, `WhatsAppButton`, `Section` (scroll-reveal wrapper).
- Site chrome (announcement bar, header, footer, mobile nav, cart drawer) lives in `__root.tsx` around `<Outlet />`.
- Imagery: royalty-free Unsplash/Pexels URLs for all products, banners, collection tiles, testimonials, and store cards.
- Each route defines its own `head()` with unique title, description, og:title, og:description.
- Fully responsive with the grid + `min-w-0` + `shrink-0` header pattern; forms are UI-only with validation and success toasts.

## Adding products later

Add an object to `src/data/products.ts` with slug, title, collection, price, images, variants, rating, stock — it appears automatically in search, collection grids, related products, and its own detail page. No component edits needed.
