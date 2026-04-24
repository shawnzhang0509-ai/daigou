import type { BannerSlide, Product, ShopCatalog } from '@/lib/shop-catalog'

const ORIGINS = new Set(['新西兰直邮', '澳洲直邮'])
const CURRENCIES = new Set(['NZ$', 'AU$'])

function isActive(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return true
  if (val === true) return true
  if (val === false || val === 0) return false
  const s = String(val).trim().toLowerCase()
  if (s === 'n' || s === 'no' || s === 'false' || s === '0' || s === '否' || s === '隐藏') return false
  return true
}

function num(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function str(v: unknown): string {
  return v === undefined || v === null ? '' : String(v).trim()
}

function parseProductRow(row: unknown): Partial<Product> & { id?: number } | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const id = num(o.id ?? o.ID ?? o['编号'])
  if (id === undefined || id <= 0) return null
  const patch: Partial<Product> & { id: number } = { id }
  const name = str(o.name ?? o.Name)
  if (name) patch.name = name
  const price = num(o.price ?? o.Price)
  if (price !== undefined) patch.price = price
  const op = num(o.original_price ?? o.originalPrice ?? o['原价'])
  if (op !== undefined && op > 0) patch.originalPrice = op
  const image = str(o.image ?? o.Image ?? o['图片'])
  if (image) patch.image = image
  const originRaw = str(o.origin ?? o.Origin ?? o['产地'])
  if (originRaw && ORIGINS.has(originRaw as Product['origin'])) {
    patch.origin = originRaw as Product['origin']
  }
  const curRaw = str(o.currency ?? o.Currency ?? o['货币'])
  if (curRaw && CURRENCIES.has(curRaw as Product['currency'])) {
    patch.currency = curRaw as Product['currency']
  }
  const sold = num(o.sold ?? o.Sold ?? o['销量'])
  if (sold !== undefined) patch.sold = Math.max(0, Math.floor(sold))
  return patch
}

function isCompleteProduct(p: Partial<Product> & { id: number }): p is Product {
  return (
    typeof p.name === 'string' &&
    p.name.length > 0 &&
    typeof p.price === 'number' &&
    Number.isFinite(p.price) &&
    typeof p.image === 'string' &&
    p.image.length > 0 &&
    p.origin !== undefined &&
    p.currency !== undefined
  )
}

function parseBannerRow(row: unknown): (BannerSlide & { _order?: number }) | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  if (!isActive(o.active ?? o.Active ?? o['显示'])) return null
  const image = str(o.image ?? o.Image ?? o['图片'])
  if (!image) return null
  const alt = str(o.alt ?? o.Alt ?? o['文案'])
  const ord = num(o.sort_order ?? o.sortOrder ?? o['顺序'])
  return { image, alt, _order: ord ?? 0 }
}

export type RemoteCatalogPayload = {
  banners?: unknown[]
  products?: unknown[]
}

/** 从 Web 应用 URL 拉取 JSON（需允许匿名访问且返回 JSON） */
export async function fetchCatalogFromUrl(url: string): Promise<RemoteCatalogPayload> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`)
  const data = (await res.json()) as unknown
  if (!data || typeof data !== 'object') return {}
  const d = data as Record<string, unknown>
  return {
    banners: Array.isArray(d.banners) ? d.banners : undefined,
    products: Array.isArray(d.products) ? d.products : undefined,
  }
}

export type CatalogMergeStats = {
  /** 接口里 banners 数组长度 */
  remoteBannerRows: number
  /** 接口里 products 数组长度 */
  remoteProductRows: number
  /** 实际用于轮播的条数（0 表示仍用本地轮播） */
  mergedBannerSlides: number
  /** 合并进目录的商品 id 数量（含仅改价、改图） */
  patchedProductIds: number
  /** 表格里新增、并挂到列表末尾的商品数 */
  extraProducts: number
}

/**
 * 用表格数据覆盖首页目录：有有效轮播则用表格轮播；商品按 id 合并到默认列表（顺序与 id 以代码为准）。
 */
export function mergeRemoteCatalog(
  base: ShopCatalog,
  remote: RemoteCatalogPayload
): { catalog: ShopCatalog; stats: CatalogMergeStats } {
  const stats: CatalogMergeStats = {
    remoteBannerRows: remote.banners?.length ?? 0,
    remoteProductRows: remote.products?.length ?? 0,
    mergedBannerSlides: 0,
    patchedProductIds: 0,
    extraProducts: 0,
  }

  let banners = base.banners
  if (remote.banners && remote.banners.length > 0) {
    const parsed = remote.banners
      .map(parseBannerRow)
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a, b) => (a._order ?? 0) - (b._order ?? 0))
      .map(({ image, alt }) => ({ image, alt }))
    if (parsed.length > 0) {
      banners = parsed
      stats.mergedBannerSlides = parsed.length
    }
  }

  const patches = new Map<number, Partial<Product> & { id: number }>()
  const extras: Product[] = []
  if (remote.products && remote.products.length > 0) {
    for (const row of remote.products) {
      const p = parseProductRow(row)
      if (!p || p.id === undefined) continue
      const rowObj = typeof row === 'object' && row !== null ? (row as Record<string, unknown>) : {}
      if (!isActive(rowObj.active ?? rowObj.Active)) continue
      const id = p.id
      const merged: Partial<Product> & { id: number } = { ...patches.get(id), ...p, id }
      patches.set(id, merged)
    }
    const baseIds = new Set(base.products.map((x) => x.id))
    for (const [, patch] of patches) {
      if (!baseIds.has(patch.id) && isCompleteProduct(patch)) {
        extras.push({ ...patch })
      }
    }
    stats.patchedProductIds = patches.size
    stats.extraProducts = extras.length
  }

  const products = [
    ...base.products.map((p) => {
      const patch = patches.get(p.id)
      if (!patch) return p
      return { ...p, ...patch }
    }),
    ...extras.sort((a, b) => a.id - b.id),
  ]

  return { catalog: { banners, products }, stats }
}

export async function loadCatalogWithSheetFallback(
  base: ShopCatalog,
  url: string | undefined
): Promise<{ catalog: ShopCatalog; error?: string; stats?: CatalogMergeStats }> {
  const trimmed = url?.trim()
  if (!trimmed) return { catalog: base }
  try {
    const remote = await fetchCatalogFromUrl(trimmed)
    const { catalog, stats } = mergeRemoteCatalog(base, remote)
    if (import.meta.env.DEV) {
      console.info('[catalog] remote loaded', stats)
    }
    return { catalog, stats }
  } catch (e) {
    console.error('[catalog]', e)
    return { catalog: base, error: '目录加载失败，已显示本地数据' }
  }
}
