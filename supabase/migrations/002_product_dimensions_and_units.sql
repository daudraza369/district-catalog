ALTER TABLE products
ADD COLUMN IF NOT EXISTS stem_length text,
ADD COLUMN IF NOT EXISTS color text;

ALTER TABLE shipment_products
ADD COLUMN IF NOT EXISTS units_per_box integer,
ADD COLUMN IF NOT EXISTS units_per_bunch integer;

ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_name_variety_key;

CREATE UNIQUE INDEX IF NOT EXISTS products_name_variety_stem_length_key
ON products (name, variety, stem_length);
