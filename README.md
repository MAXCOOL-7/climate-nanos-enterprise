# Climate Nanos Enterprise — Company Website

The official company website for **Climate Nanos Enterprise**, the mother company of **Smart Solar Agri-Hub**. It introduces the company and its mission, leadership team, traction and milestones, and links visitors to the Smart Solar Agri-Hub store (Shopify) and the company LinkedIn page.

## Sections
- Hero with links to the store and a quick-stats bar
- About Us: story, mission, vision, values, company facts, problem and solution
- Ecosystem: Lab → Farm → Impact
- Leadership: the eight-person executive team
- Milestones: a traction timeline since Dec 2, 2024, with time elapsed calculated automatically
- Contact form (Netlify Forms) with a `/thank-you` confirmation page

## Technologies
- Plain HTML, CSS and vanilla JavaScript with no build step (`public/`)
- Netlify Forms for contact submissions
- Netlify Image CDN (`/.netlify/images`) for resized WebP images

## Run locally
```bash
netlify dev
```
Or open `public/index.html` directly. Images load through the Image CDN, so they only render under `netlify dev` or once deployed.
