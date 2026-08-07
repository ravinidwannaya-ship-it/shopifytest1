# Shopify Standard Theme for Kyathi Heritage

Deliver a Shopify Online Store 2.0 theme that imports cleanly into the user's existing Shopify store, plus the required files to migrate the Kyathi brand and catalog from the current Lovable app.

## Clarified requirements
- Connect to an existing Shopify store (not create a new one).
- Extract the theme into a proper repo folder (`shopify-theme/`) so it can be edited directly.
- Keep the existing Lovable React storefront untouched while the Shopify theme is built and tested.
- Remove the Cloudflare reverse-proxy files because the user does not need them; the Lovable app and Shopify store are separate.

## 1. Clean up repo
- Delete `cloudflare/worker-proxy.js` and the `cloudflare/` directory.
- Remove any Cloudflare references from README and other docs.

## 2. Connect existing Shopify store
- Enable the Shopify integration in `existing` mode.
- Prompt the user to paste their Shopify admin URL (e.g., `https://kyathi.myshopify.com/admin`).
- Store the connection credentials/secrets as environment variables via Lovable-managed connection.
- Verify the connection with a lightweight Storefront / Admin API call.

## 3. Build `shopify-theme/` folder with proper OS 2.0 structure

```text
shopify-theme/
├── config/
│   └── settings_schema.json
├── layout/
│   ├── theme.liquid
│   ├── password.liquid
│   └── gift_card.liquid
├── locales/
│   └── en.default.json
├── templates/
│   ├── index.json
│   ├── product.json
│   ├── collection.json
│   ├── cart.json
│   ├── search.json
│   ├── 404.json
│   ├── page.json
│   ├── page.contact.json
│   ├── page.faq.json
│   ├── page.about.json
│   ├── page.customize-idol.json
│   ├── page.corporate-gifting.json
│   ├── customers/login.json
│   ├── customers/register.json
│   ├── customers/account.json
│   ├── customers/order.json
│   ├── customers/addresses.json
│   └── customers/reset_password.json
├── sections/
│   ├── header.liquid
│   ├── footer.liquid
│   ├── announcement-bar.liquid
│   ├── hero-slideshow.liquid
│   ├── featured-collection.liquid
│   ├── product-grid.liquid
│   ├── product-card.liquid
│   ├── main-product.liquid
│   ├── main-collection.liquid
│   ├── cart-drawer.liquid
│   ├── trust-bar.liquid
│   ├── newsletter.liquid
│   ├── testimonial-carousel.liquid
│   ├── store-locator.liquid
│   ├── process-steps.liquid
│   ├── enquiry-form.liquid
│   ├── collection-list.liquid
│   └── prototype-notice.liquid
├── snippets/
│   ├── price.liquid
│   ├── rating-stars.liquid
│   ├── icon-cart.liquid
│   ├── icon-search.liquid
│   ├── icon-heart.liquid
│   ├── share-button.liquid
│   ├── whatsapp-button.liquid
│   └── css-variables.liquid
└── assets/
    ├── theme.css
    ├── theme.js
    ├── kyathi-logo.png
    ├── favicon.png
    └── kyathi-og.jpg
```

## 4. Theme configuration and styling
- Replicate the Kyathi design system: deep maroon/terracotta primary, warm brown, gold/brass accent, cream background, charcoal text.
- Use Cormorant Garamond for headings and Karla for body, loaded via Google Fonts link.
- Add `settings_schema.json` controls for brand logo, colors, typography, announcement text, footer contact info, WhatsApp number, and UPI ID/QR.
- Keep mobile-first responsive CSS with safe-area insets and bottom-nav spacing.

## 5. Product data migration
- Export a `kyathi-products-import.csv` file that matches Shopify's product import format.
- Map the current Lovable product data (title, description, variants, images, prices, tags) into Shopify columns.
- Include two collections: "Metal Gold Coated Silver Idols" and "Photo Frame Idols".
- Provide clear instructions for importing the CSV into the connected Shopify store.

## 6. Shopify-specific features
- Product page with variant selectors, quantity picker, add-to-cart, buy-now, and sticky mobile bar.
- Collection page with filters (deity, material, finish, price) and sort dropdown.
- AJAX cart drawer and slide-out search overlay.
- Customer account templates (login, register, order history, addresses).
- WhatsApp enquiry and share buttons on product pages.
- Dismissible prototype notice bar.
- Custom idol enquiry page with dropdown-based questionnaire and image reference upload.
- Corporate gifting page with enquiry form.
- Trust bar, newsletter, and testimonial sections.

## 7. Validation and packaging
- Validate every Liquid file for balanced tags and correct schema references.
- Validate every JSON template file for correct section/block references.
- Ensure no root-level files exist in the ZIP other than the required folders.
- Produce an upload-ready `kyathi-heritage-shopify-theme-v4.zip` from the `shopify-theme/` folder.
- Provide step-by-step upload instructions and a troubleshooting note.

## Deliverables
- `shopify-theme/` folder in the repo.
- `kyathi-heritage-shopify-theme-v4.zip`.
- `kyathi-products-import.csv`.
- `SHOPIFY_SETUP.md` with import, upload, and connection instructions.

## Notes
- The existing Lovable React app will remain as the primary live storefront until the user publishes the Shopify theme.
- The user must approve the Shopify connection step before any store data is read or written.
