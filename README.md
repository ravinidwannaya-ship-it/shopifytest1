# Kyathi Heritage

Build a premium e-commerce website for a sculpture and idol brand called "[kyathi]" — 

similar in quality and structure to silaii.com. This is a D2C brand selling handcrafted god idols, 

leader/icon busts, temple monument replicas, and cultural sculptures, ranging from 5-inch desk pieces 

to life-size statues. Use royalty-free stock images (Unsplash/Pexels style) as placeholders for all 

products and banners — search for "bronze statue," "brass idol," "sculpture art," "temple carving," 

"Ganesha idol," "marble bust" as image references.

BRAND FEEL:

Warm, earthy, premium, spiritual-meets-modern. Color palette: deep maroon/terracotta, warm brown, 

gold/brass accents, cream background. Elegant serif font for headings, clean sans-serif for body. 

Should feel like a luxury heritage brand, not a generic online store.

PAGES & STRUCTURE:

1. HOMEPAGE

- Sticky top announcement bar: "Free Shipping on orders above ₹999"

- Header: logo center or left, nav menu (New Launches, Divine Series, Leaders & Icons, Monuments, 

  Pride of India, Life-Size Sculptures, Corporate Gifting), search icon, account icon, cart icon

- Hero banner carousel (3-4 slides) with large sculpture imagery and CTA buttons

- "Trending Products" horizontal scroll section with star ratings and review counts on each card

- "Most Gifted" and "New Launches" product grid sections (4-6 products each, with sale price + 

  regular price strikethrough, "Add to Cart" buttons)

- Trust bar: "10-Day Easy Returns", "Trusted by 2 Lakh+ Customers", "Certified Authentic Sculptures"

- "Best-Selling Favorites" section

- "Explore Our Collections" category tiles (Divine, Monuments, Leaders & Icons, Pride of India) 

  with large lifestyle images

- Testimonials carousel with customer photos, product tag, and quote

- Store locator section with two sample store cards (image, address, timing, "Get Directions" button)

- Newsletter signup section ("Join [Brand] Insider — exclusive offers and stories")

- Footer: 4 columns — About/Info links, Shop by Category, Contact + store support info, 

  newsletter signup repeat, payment icons, social icons

2. SHOP / COLLECTION PAGE (template for all categories)

- Left sidebar filters: Deity/Figure, Material (Brass, Resin, Marble, Bronze), Height/Size, 

  Price range, Finish

- Top bar: sort dropdown (Best-selling, Price low-high, Newest), product count

- Product grid (3-4 columns desktop, 2 mobile) with hover image swap, rating, price, quick add-to-cart

3. PRODUCT DETAIL PAGE

- Image gallery (left, 4-5 images, zoom-on-hover, thumbnail strip)

- Right column: product title, star rating + review count, price (sale + regular), 

  size/height variant selector with price change, material/finish selector, quantity, 

  "Add to Cart" and "Buy Now" buttons

- Trust icons row below buttons: Secure Payment, Easy Returns, Certified Authentic, Free Shipping

- Delivery estimate input (pincode check)

- Tabs: Description, Specifications (dimensions, weight, material), Shipping & Returns

- "Customer Reviews" section with photo reviews

- "You May Also Like" related products carousel

- WhatsApp floating button for enquiries

4. CUSTOM SCULPTURE ENQUIRY PAGE

- Hero banner explaining custom/bespoke sculpture service

- Form: Name, Phone, Email, Sculpture type/description, Reference image upload, Budget range, 

  Preferred size — submit button

- Process explainer: 4-step visual (Consultation → Design Approval → Crafting → Delivery)

5. CORPORATE GIFTING PAGE

- Hero banner for bulk/corporate orders

- Benefits grid: Custom branding, Bulk pricing, Dedicated support, Pan-India delivery

- Enquiry form: Company name, contact, quantity needed, occasion, message

- Logo strip placeholder for "Trusted by" corporate clients

6. ABOUT US PAGE

- Brand story section with founder quote

- Craftsmanship/process section (image + text pairs: sourcing, sculpting, finishing, quality check)

- Values section (authenticity, heritage, craftsmanship)

7. CART & CHECKOUT

- Clean cart drawer/page with product thumbnails, quantity editors, remove option

- Checkout: shipping address form, order summary, payment method selection 

  (Card/UPI/Netbanking/COD radio buttons), place order button

- Trust badges near payment section

8. STANDARD PAGES

- Contact Us (form + store address + map embed placeholder)

- FAQ (accordion style)

- Return & Refund Policy, Shipping Policy, Terms of Use, Privacy Policy (simple text layout pages)

- Track Your Order (order ID + email lookup form UI)

PREMIUM FEATURES TO INCLUDE IN THE UI/UX:

- Product card hover effect (image swap + quick-add button appears)

- Sticky "Add to Cart" bar that appears on scroll on product pages

- Wishlist/heart icon on product cards

- Live stock scarcity badges ("Only 3 left")

- Star rating display everywhere a product appears

- Mobile-first responsive design with bottom nav bar on mobile (Home, Shop, Cart, Account)

- Smooth scroll animations and fade-ins on section load

- Search with live product suggestions dropdown

- Loading skeleton states for product grids

TECHNICAL:

- Fully responsive (mobile, tablet, desktop)

- Component-based structure (ProductCard, CollectionGrid, TestimonialCarousel, etc. as reusable components)

- Use placeholder cart/checkout logic with mock state management since this is a design-first build

- All product data (name, price, images, rating) should come from a mock JSON/array so it's easy 

  to swap in real data later

Generate this as a multi-page React app with clean, production-ready component structure.   make its stracture  like easy to  add edit delete,  product in future, a perfect e commerce shop.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kyathi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e15e7019-92af-40bc-ac00-0390b1a6c1d8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
