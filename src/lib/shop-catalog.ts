/** 商品（首页列表与购物车共用字段） */
export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  origin: '新西兰直邮' | '澳洲直邮'
  currency: 'NZ$' | 'AU$'
  sold?: number
}

export interface BannerSlide {
  image: string
  alt: string
}

export interface ShopCatalog {
  banners: BannerSlide[]
  products: Product[]
}

export const defaultShopCatalog: ShopCatalog = {
  banners: [
    { image: '/banner-1.jpg', alt: '新春特惠' },
    { image: '/banner-2.jpg', alt: '新西兰直邮' },
  ],
  products: [
    {
      id: 1,
      name: 'My Organics 意大利无硅 枸杞洗发水 250ml 固发防脱',
      price: 24.99,
      image: '/category-care.jpg',
      origin: '新西兰直邮',
      currency: 'NZ$',
      sold: 2341,
    },
    {
      id: 2,
      name: 'Avene 雅漾 Xeracalm A.D霜 400ml【限时特惠】',
      price: 48.99,
      originalPrice: 68.99,
      image: '/category-care.jpg',
      origin: '新西兰直邮',
      currency: 'NZ$',
      sold: 1523,
    },
    {
      id: 3,
      name: 'Moroccanoil摩洛哥 发油 美发护理干枯毛躁 100ml',
      price: 65.23,
      image: '/category-care.jpg',
      origin: '新西兰直邮',
      currency: 'NZ$',
      sold: 987,
    },
    {
      id: 4,
      name: 'Bio Revive 加强版解酒片 30粒',
      price: 36.45,
      image: '/category-vitamins.jpg',
      origin: '澳洲直邮',
      currency: 'AU$',
      sold: 856,
    },
    {
      id: 5,
      name: 'Blackmores 澳佳宝 天然维生素E软胶囊 1000IU 100粒',
      price: 42.56,
      image: '/product-vitaminc.jpg',
      origin: '澳洲直邮',
      currency: 'AU$',
      sold: 3421,
    },
    {
      id: 6,
      name: 'Swisse 斯维诗 胶原蛋白片 100片',
      price: 26.45,
      originalPrice: 32.99,
      image: '/product-collagen.jpg',
      origin: '澳洲直邮',
      currency: 'AU$',
      sold: 2109,
    },
    {
      id: 7,
      name: 'Swisse 斯维诗 高含量蔓越莓 90粒',
      price: 36.99,
      image: '/product-grapeseed.jpg',
      origin: '澳洲直邮',
      currency: 'AU$',
      sold: 1876,
    },
    {
      id: 8,
      name: 'A2 Platinum 婴幼儿奶粉 3段 900g',
      price: 45.99,
      image: '/product-a2milk.jpg',
      origin: '新西兰直邮',
      currency: 'NZ$',
      sold: 5621,
    },
  ],
}

type BannerUpdater = BannerSlide[] | ((prev: BannerSlide[]) => BannerSlide[])
type ProductUpdater = Product[] | ((prev: Product[]) => Product[])

/**
 * 一次性替换轮播或商品列表；传入函数时可基于上一状态计算（与 setState 类似）。
 */
export function updateShopCatalog(
  catalog: ShopCatalog,
  updates: { banners?: BannerUpdater; products?: ProductUpdater }
): ShopCatalog {
  return {
    banners:
      updates.banners === undefined
        ? catalog.banners
        : typeof updates.banners === 'function'
          ? updates.banners(catalog.banners)
          : updates.banners,
    products:
      updates.products === undefined
        ? catalog.products
        : typeof updates.products === 'function'
          ? updates.products(catalog.products)
          : updates.products,
  }
}

/** 按 id 合并字段，例如只改 image / price */
export function updateProductInCatalog(
  catalog: ShopCatalog,
  id: number,
  patch: Partial<Omit<Product, 'id'>>
): ShopCatalog {
  return {
    ...catalog,
    products: catalog.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }
}

/** 按索引改某一帧 banner */
export function updateBannerInCatalog(
  catalog: ShopCatalog,
  index: number,
  patch: Partial<BannerSlide>
): ShopCatalog {
  return {
    ...catalog,
    banners: catalog.banners.map((b, i) => (i === index ? { ...b, ...patch } : b)),
  }
}
