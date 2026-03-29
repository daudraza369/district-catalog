import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { ORIGIN_LABELS, type Origin } from '@/lib/types'

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
      }
    | Array<{
        name: string
        variety: string
        stem_length: string | null
        origin: Origin
      }>
    | null
}

function getProduct(row: ExportRow) {
  if (!row.products) return null
  return Array.isArray(row.products) ? row.products[0] : row.products
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
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
        origin
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
    <title>Wholesale Pricelist Export</title>
    <style>
      body { font-family: 'PP Fragment', Arial, sans-serif; color: #20322a; margin: 24px; }
      h1 { font-family: 'PP Fragment', Arial, sans-serif; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-align: center; margin: 8px 0 16px; }
      .top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
      .meta { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(32,50,42,0.7); }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border-bottom: 1px solid rgba(32,50,42,0.2); padding: 8px 6px; font-size: 11px; text-transform: uppercase; }
      th { color: rgba(32,50,42,0.6); text-align: left; }
      .price { text-align: right; }
      .print-btn { position: fixed; top: 12px; right: 12px; border: 1px solid #20322a; background: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
      @media print {
        .print-btn { display: none; }
      }
    </style>
  </head>
  <body>
    <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
    <div class="top">
      <img src="/7.svg" width="42" height="42" />
      <div class="meta">${activeShipment ? `Arrival: ${activeShipment.arrival_date}` : ''}</div>
    </div>
    <h1>Wholesale Pricelist</h1>
    <div class="meta">${filterLabel || 'All Products'}</div>
    <table>
      <thead>
        <tr>
          <th>Variety</th>
          <th>Flower Type</th>
          <th>Origin</th>
          <th>Stock</th>
          <th class="price">Price Per Stem</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${row.variety}</td>
            <td>${row.stem_length ? `${row.name} · ${row.stem_length}` : row.name}</td>
            <td>${ORIGIN_LABELS[row.origin]}</td>
            <td>${row.stock ? 'YES' : 'NO'}</td>
            <td class="price">SAR ${Number(row.price).toFixed(2)}</td>
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
