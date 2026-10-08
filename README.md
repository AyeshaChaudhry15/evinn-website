# EVINN — public website

Next.js 16 (App Router) storefront for EVINN, an electric bike shop. It reads the catalogue from the Evinn API
(see `API.md`) and submits the three public forms. It does **not** use any admin endpoint.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set NEXT_PUBLIC_API_URL
npm run dev                  # http://localhost:3000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL including `/api`, e.g. `https://api.evinn.pk/api`. Defaults to `http://localhost:5000/api`. |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this site, used for canonical / Open Graph metadata. Optional. |

The browser calls the API directly for form submissions, so this site's origin (e.g. `http://localhost:3000`)
must be listed in the API server's `CLIENT_URL` (CORS).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## How it talks to the API

| Endpoint | Where |
|---|---|
| `GET /brands`, `GET /brands/:id` | Home, `/brands`, `/brands/[id]`, bike filters, footer, test-ride form |
| `GET /bikes` (search, brand, type, price, top speed, range, pagination) | `/vehicles`, `/electric-bikes`, `/electric-scooters`, home, brand pages, compare, warranty check, navbar search |
| `GET /bikes/:slug` | `/bikes/[slug]`, `/checkout?bike=<slug>` |
| `GET /accessories`, `GET /accessories/:slug` | `/accessories`, `/accessories/[slug]`, navbar search |
| `GET /spare-parts`, `GET /spare-parts/:slug` | `/spare-parts`, `/spare-parts/[slug]`, navbar search |
| `POST /contact-submissions` | `/contact-us`, `/service-booking` (sent as a "Support" message) |
| `POST /test-ride-requests` | `/book-test-ride` |
| `POST /orders` | `/checkout` (one order per bike in the cart) |

- Catalogue reads happen in Server Components (`src/lib/catalog.ts`) and are cached for 60 seconds.
- Filters and pagination live in the URL and are passed straight to the API's query parameters.
- Form submissions run in the browser (`src/lib/submissions.ts`) because the API rate-limits them per visitor IP.
- Accessories and spare parts can't be ordered through the API, so their pages offer an enquiry instead.

## Project structure

```
src/
  app/          Routes (pages, loading / error / not-found UI)
  components/   UI by feature: catalog, cart, checkout, forms, layout, ui, ...
  data/         Static content (blog posts, FAQs, legal pages, guides, contact details)
  lib/          API client, catalogue queries, form submissions, cart store, validation, formatting
  types/api.ts  Types for the public API
```

Styling is Tailwind CSS v4 only; the colour palette is defined as theme tokens in `src/app/globals.css`.
Animations use Framer Motion and respect the user's reduced-motion setting.
