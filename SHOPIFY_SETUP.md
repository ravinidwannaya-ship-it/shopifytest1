# Shopify Setup Guide — Kyathi Heritage

This folder contains a complete Shopify Online Store 2.0 theme that can be uploaded directly to your Shopify store.

## What is in this folder

```text
shopify-theme/
├── config/           Theme settings schema
├── layout/           theme.liquid, password.liquid, gift_card.liquid
├── locales/          English default translations
├── templates/        Page templates (JSON + Liquid)
├── sections/         Reusable sections
├── snippets/         Shared snippets
└── assets/           CSS, JavaScript, logo, favicon
```

## Quick start

1. Zip the `shopify-theme/` folder (make sure the folder is at the root of the zip, not nested inside another folder).
2. In your Shopify admin, go to **Online Store → Themes**.
3. Click **Add theme → Upload zip file** and select the zip.
4. Wait for Shopify to process it, then click **Customize** to edit the theme settings.
5. Publish the theme when you are ready to make it live.

## Import products

A product CSV is included in the repo: `kyathi-products-import-v4.csv`.

1. In Shopify admin, go to **Products → Import**.
2. Upload the CSV file.
3. Shopify will create the products and variants. Review the import and fix any missing images afterward.

## Configure the header menu

After the theme is uploaded:

1. Open **Online Store → Navigation**.
2. Create or edit the **Main menu**.
3. Add links to:
   - Gold Coated Silver Idols (`/collections/gold-coated-silver`)
   - Idols with Photo Frames (`/collections/photo-frames`)
   - Customise Idol (`/pages/customize-idol`)
   - Corporate Gifting (`/pages/corporate-gifting`)
   - About Us (`/pages/about`)
   - Contact (`/pages/contact`)

## Create the pages

Before the menu links above will work, create the pages in **Online Store → Pages**:

- Title: **Customise Idol** → Handle: `customize-idol` → Template: `page.customize-idol`
- Title: **Corporate Gifting** → Handle: `corporate-gifting` → Template: `page.corporate-gifting`
- Title: **About** → Handle: `about` → Template: `page.about`
- Title: **Contact** → Handle: `contact` → Template: `page.contact`

## Create collections

The product CSV uses the tags `gold-coated-silver` and `photo-frames`. Create two automated collections with those conditions so the collection templates work:

1. **Gold Coated Silver Idols** — condition: `Product tag is equal to gold-coated-silver`
2. **Idols with Photo Frames** — condition: `Product tag is equal to photo-frames`

## Theme settings to update

Inside **Customize**, open the **Theme settings** panel and update:

- **Brand**: Upload your logo and favicon.
- **Contact & social**: Phone, WhatsApp, email, address, hours, social links.
- **Notice bar**: Enable the prototype caution message if this is still a test store.
- **Cart**: Free shipping threshold.
- **Colours / Typography**: Already set to Kyathi brand; adjust if needed.

## Cloudflare note

The Cloudflare reverse-proxy files have been removed from the repo. The Lovable React app and the new Shopify store are separate deployments. You do not need a Cloudflare Worker for the Shopify theme.

## Troubleshooting upload errors

If Shopify rejects the zip:

- Make sure the zip contains only the folders listed above (no README, CSV, or ZIP files at the root).
- Ensure the folder is named `shopify-theme` inside the repo, but the zip itself should not contain a parent `shopify-theme-v4` folder — the folders above should be at the zip root.
- If you see a section error, check that the template JSON files reference section files that exist in `sections/`.

## Files you will deliver

- `kyathi-heritage-shopify-theme-v4.zip` — the upload-ready Shopify theme.
- `kyathi-products-import-v4.csv` — product and variant import file.
- This folder — the editable theme source.
