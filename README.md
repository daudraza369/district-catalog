# District Catalog

Premium B2B wholesale flower catalog for District Flowers (Riyadh, Saudi Arabia), built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Project Overview

- Public catalog page replicating the premium editorial reference design
- Sticky filter system (search, origin, stock) with URL-driven state
- Admin panel with password gate, product management, shipment management, image library, and ingest instructions
- Ingestion API for AI-driven shipment uploads (Claude/ChatGPT/Gemini compatible)
- Supabase-backed data model with shipments, products, shipment products, and image library

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Fill `.env.local` with your Supabase values and secrets.
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` (catalog) and `http://localhost:3000/admin` (admin panel).

## Environment Variables

Set the following keys in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `INGEST_SECRET`

## Database Setup

Apply migration:

- `supabase/migrations/001_initial_schema.sql`

This creates:

- `shipments`
- `products`
- `shipment_products`
- `image_library`

Plus indexes and RLS policies for public reads and service-role writes.

## AI Ingest Guide

Endpoint:

- `POST /api/ingest`
- Header: `Authorization: Bearer <INGEST_SECRET>`
- Content-Type: `application/json`

### AI Prompt Template

```text
Extract the flower catalog data from the attached PDF/image and POST it to the District Catalog API.

Endpoint: POST https://[your-domain]/api/ingest
Authorization: Bearer [your-ingest-secret]
Content-Type: application/json

Format the body as:
{
  "shipment": {
    "batch_id": "[extract from document]",
    "arrival_date": "[extract date in YYYY-MM-DD format]",
    "price_unit": "per_stem"
  },
  "products": [
    {
      "name": "[flower name]",
      "variety": "[variety name]",
      "origin": "[one of: netherlands, kenya, saudi, south_africa, italy, ecuador, colombia, other]",
      "price": [numeric price],
      "stock": [true if available, false if not]
    }
  ]
}

Extract ALL products from the document. Map country names to origin values: Netherlands→netherlands, Kenya→kenya, Saudi Arabia→saudi, South Africa→south_africa, Italy→italy, Ecuador→ecuador, Colombia→colombia.
Make the POST request with the Authorization header and this JSON body.
```

## Deploy to Coolify

1. Create a new **Application** in Coolify from your Git repository.
2. Set **Build Pack** to Node.js and ensure install/build/start commands:
   - Install: `npm ci`
   - Build: `npm run build`
   - Start: `npm run start`
3. Configure environment variables from the list above.
4. Set exposed port to `3000`.
5. Deploy and verify:
   - `/` renders catalog
   - `/admin` allows authenticated admin access
   - `/api/catalog` and `/api/ingest` respond correctly
