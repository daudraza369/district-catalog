import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { ORIGIN_LABELS, type Origin } from '@/lib/types'
import { getFlowerImagePath } from '@/lib/flower-images'

type ExportRow = {
  id: string
  price: number
  stock: boolean
  shipments: { id: string; is_active: boolean }[] | { id: string; is_active: boolean } | null
  products:
    | {
        name: string
        variety: string
        stem_length: string | null
        origin: Origin
        image_url: string | null
      }
    | Array<{
        name: string
        variety: string
        stem_length: string | null
        origin: Origin
        image_url: string | null
      }>
    | null
}

function getProduct(row: ExportRow) {
  if (!row.products) return null
  return Array.isArray(row.products) ? row.products[0] : row.products
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('mode') ?? 'b2c'
  const origin = searchParams.get('origin') ?? ''
  const flowerType = searchParams.get('flower_type') ?? ''
  const stock = searchParams.get('stock')

  const supabase = createAdminClient()
  const { data: activeShipment } = await supabase
    .from('shipments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data } = await supabase
    .from('shipment_products')
    .select(
      `
      id,
      price,
      stock,
      shipments!inner (
        id,
        is_active
      ),
      products (
        name,
        variety,
        stem_length,
        origin,
        image_url
      )
    `
    )
    .eq('shipments.is_active', true)
    .order('name', { ascending: true, referencedTable: 'products' })
    .order('variety', { ascending: true, referencedTable: 'products' })

  const rows = ((data ?? []) as ExportRow[])
    .map((row) => ({ row, product: getProduct(row) }))
    .filter((item) => Boolean(item.product))
    .map((item) => ({
      name: item.product!.name,
      variety: item.product!.variety,
      stem_length: item.product!.stem_length,
      origin: item.product!.origin,
      image_url: item.product!.image_url ?? getFlowerImagePath(item.product!.name, item.product!.variety),
      price: item.row.price,
      stock: item.row.stock
    }))
    .filter((item) => (origin ? item.origin === origin : true))
    .filter((item) => (flowerType ? item.name === flowerType : true))
    .filter((item) => (stock === 'true' ? item.stock : true))

  const filterLabel = [origin ? ORIGIN_LABELS[origin as Origin] : '', flowerType || '', stock === 'true' ? 'In Stock' : '']
    .filter(Boolean)
    .join(' · ')

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>District Catalog Export</title>
    <style>
      :root {
        --brand-green: #20322a;
        --brand-muted: rgba(32,50,42,0.55);
        --brand-border: rgba(32,50,42,0.2);
        --brand-bg: #fbfbf8;
      }
      body {
        font-family: 'PP Fragment', Arial, sans-serif;
        color: var(--brand-green);
        background: var(--brand-bg);
        margin: 20px;
      }
      .top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        border-bottom: 1px solid var(--brand-border);
        padding-bottom: 10px;
        margin-bottom: 12px;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.13em;
        color: var(--brand-muted);
        text-align: right;
      }
      .meta strong {
        color: var(--brand-green);
        font-weight: 700;
        letter-spacing: 0.15em;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }
      col.image-col { width: 64px; }
      col.variety-col { width: 26%; }
      col.type-col { width: 30%; }
      col.origin-col { width: 16%; }
      col.stock-col { width: 10%; }
      col.price-col { width: 18%; }
      th, td {
        border-bottom: 1px solid var(--brand-border);
        padding: 8px 6px;
      }
      th {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: var(--brand-muted);
        text-align: left;
      }
      td {
        font-size: 11px;
        letter-spacing: 0.03em;
        vertical-align: middle;
      }
      .image-cell {
        width: 52px;
        height: 52px;
        overflow: hidden;
        background: #f1f1ec;
      }
      .image-cell img {
        width: 52px;
        height: 52px;
        object-fit: cover;
        display: block;
      }
      .stock { text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; color: var(--brand-muted); }
      .price { text-align: right; font-weight: 600; letter-spacing: 0.08em; }
      .price-head { text-align: right; }
      .print-btn {
        position: fixed;
        top: 10px;
        right: 10px;
        border: 1px solid var(--brand-green);
        background: white;
        padding: 8px 10px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      @media print {
        .print-btn { display: none; }
      }
    </style>
  </head>
  <body>
    <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
    <div class="top">
      <img src="/7.svg" width="88" height="88" />
      <div class="meta">
        <span>${activeShipment ? `Arrival: ${activeShipment.arrival_date}` : ''}</span>
        <strong>${filterLabel || 'All Products'}</strong>
      </div>
    </div>
    <table>
      <colgroup>
        <col class="image-col" />
        <col class="variety-col" />
        <col class="type-col" />
        <col class="origin-col" />
        <col class="stock-col" />
        <col class="price-col" />
      </colgroup>
      <thead>
        <tr>
          <th>Image</th>
          <th>Variety</th>
          <th>Flower Type</th>
          <th>Origin</th>
          <th>Stock</th>
          <th class="price-head">${mode === 'b2b' ? 'Price Per Stem' : 'Price Per Bunch'}</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>
              <div class="image-cell">
                ${row.image_url ? `<img src="${row.image_url}" alt="${row.name} ${row.variety}" />` : ''}
              </div>
            </td>
            <td>${row.variety}</td>
            <td>${row.stem_length ? `${row.name} · ${row.stem_length}` : row.name}</td>
            <td>${ORIGIN_LABELS[row.origin]}</td>
            <td class="stock">${row.stock ? 'YES' : 'NO'}</td>
            <td class="price">SAR ${Number(mode === 'b2b' ? row.price : row.price * 10).toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    <script>
      window.setTimeout(() => window.print(), 300);
    </script>
  </body>
</html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
