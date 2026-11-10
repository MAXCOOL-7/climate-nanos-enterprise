# AGENTS.md

## Architecture
A static site with no framework and no build step. Netlify publishes `public/`, as configured in `netlify.toml`.

- `public/index.html`: a single-page company site. Sections are anchored by id: about, ecosystem, leadership, milestones, contact.
- `public/styles.css`: all styles. Theme colors are CSS variables in `:root`, taken from the original brand: green #0e4d2a, accent #2e9b5a, yellow #ffdd57, and teal from the logo.
- `public/main.js`: mobile menu, the auto-updating "time since founding" text (`data-elapsed`, `data-elapsed-long`), the footer year and the copy-password button.
- `public/thank-you.html`: the page users see after submitting the contact form.
- `public/img/`: logo, prototype photo, and `team/*.jpg` headshots cropped from the executive team poster.

## Conventions and decisions
- Every image is referenced through Netlify Image CDN (`/.netlify/images?url=/img/...&w=...&fm=webp`), never as the raw file.
- The contact form is a static Netlify Form (`name="contact"`, honeypot `bot-field`). Form detection is turned on by the `.netlify/features/netlify-forms` marker. If you add form fields, keep them in the static HTML.
- External links (Shopify store, LinkedIn) open in a new tab with `rel="noopener"`.
- The Shopify store password appears in the hero card at the owner's request, as a pre-launch measure. Remove the `.note` paragraph in the hero card once the store is public.
- The milestones are in chronological order. The FUNAAB academic endorsement has no date, so it is listed last as "Ongoing".
