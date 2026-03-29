-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shipments table
create table shipments (
  id uuid primary key default gen_random_uuid(),
  batch_id text not null,
  arrival_date date not null,
  price_unit text not null default 'per_stem',
  is_active boolean default false,
  created_at timestamptz default now()
);

-- Products master table (flower library)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  variety text not null,
  stem_length text,
  color text,
  origin text not null check (origin in ('netherlands', 'ethiopia', 'kenya', 'saudi', 'south_africa', 'italy', 'ecuador', 'colombia', 'other')),
  image_url text,
  active boolean default true,
  created_at timestamptz default now(),
  unique(name, variety, stem_length)
);

-- Junction table: products in a specific shipment
create table shipment_products (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references shipments(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  price numeric(10,2) not null,
  stock boolean default true,
  created_at timestamptz default now(),
  unique(shipment_id, product_id)
);

-- Image library table
create table image_library (
  id uuid primary key default gen_random_uuid(),
  flower_name text not null,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- Indexes for performance
create index on shipment_products(shipment_id);
create index on shipment_products(product_id);
create index on products(name);
create index on image_library(flower_name);

-- Row Level Security
alter table shipments enable row level security;
alter table products enable row level security;
alter table shipment_products enable row level security;
alter table image_library enable row level security;

-- Public read access for catalog
create policy "Public read shipments" on shipments for select using (true);
create policy "Public read products" on products for select using (true);
create policy "Public read shipment_products" on shipment_products for select using (true);
create policy "Public read image_library" on image_library for select using (true);

-- Service role has full access (used by API routes via service_role key)
create policy "Service role full access shipments" on shipments using (auth.role() = 'service_role');
create policy "Service role full access products" on products using (auth.role() = 'service_role');
create policy "Service role full access shipment_products" on shipment_products using (auth.role() = 'service_role');
create policy "Service role full access image_library" on image_library using (auth.role() = 'service_role');
