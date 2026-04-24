import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { 
  ShoppingCart, Home, Grid3X3, Headphones, User, Search, 
  MapPin, Plus, Minus, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { BannerSlide, Product, ShopCatalog } from '@/lib/shop-catalog'
import { defaultShopCatalog } from '@/lib/shop-catalog'
import { loadCatalogWithSheetFallback, type CatalogMergeStats } from '@/lib/sheet-catalog'

interface CartLine {
  id: number
  quantity: number
}

type CartRow = Product & { quantity: number }

// Banner Carousel Component
function BannerCarousel({ banners }: { banners: BannerSlide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (banners.length === 0) return
    const n = banners.length
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % n)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  const activeIndex = banners.length === 0 ? 0 : currentSlide % banners.length

  if (banners.length === 0) {
    return (
      <div className="relative w-full aspect-[16/9] max-h-[400px] overflow-hidden bg-[#242424] flex items-center justify-center text-white/40 text-sm">
        暂无轮播图
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-[16/9] max-h-[400px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={banner.image} 
            alt={banner.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Header Component
function Header({ cartCount, onCartClick }: { cartCount: number; onCartClick: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#1a1a1a]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="#" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e53935] to-[#ff6f60] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NZ</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">纽奥康源</span>
          </a>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="搜索商品..."
                className="w-full h-9 pl-10 pr-4 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#e53935]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={onCartClick}
              className="relative p-2 text-white/80 hover:text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e53935] text-white text-[10px] rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// Product Card Component
function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <div className="bg-[#242424] rounded-lg overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square bg-[#1a1a1a]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-[#e53935] text-white text-xs px-2 py-0.5 rounded">
            特惠
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Origin Tag */}
        <div className="flex items-center text-xs text-[#4caf50] mb-2">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{product.origin}</span>
        </div>

        {/* Name */}
        <h3 className="text-white text-sm line-clamp-2 mb-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-[#e53935] font-bold text-lg">
            {product.currency}{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-white/40 text-sm line-through">
              {product.currency}{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Sold & Add Button */}
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs">
            {product.sold?.toLocaleString()}人付款
          </span>
          <button 
            onClick={onAdd}
            className="w-7 h-7 bg-[#e53935] rounded-full flex items-center justify-center hover:bg-[#c62828] transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Category Tabs
function CategoryTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'all', name: '全部' },
    { id: 'nz', name: '新西兰直邮' },
    { id: 'au', name: '澳洲直邮' },
    { id: 'care', name: '个人护理' },
    { id: 'health', name: '营养保健' },
    { id: 'baby', name: '母婴用品' },
  ]

  return (
    <div className="sticky top-14 z-40 bg-[#1a1a1a] border-b border-white/10">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
              activeTab === tab.id ? 'text-[#e53935]' : 'text-white/60 hover:text-white'
            }`}
          >
            {tab.name}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#e53935] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// Cart Dialog
function CartDialog({ 
  isOpen, 
  onClose, 
  cartLines,
  products,
  onUpdateQuantity,
  onRemove
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  cartLines: CartLine[];
  products: Product[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  const cartRows: CartRow[] = useMemo(() => {
    return cartLines
      .map((line) => {
        const p = products.find((x) => x.id === line.id)
        if (!p) return null
        return { ...p, quantity: line.quantity }
      })
      .filter((row): row is CartRow => row !== null)
  }, [cartLines, products])

  const total = cartRows.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>购物车 ({cartRows.length})</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[50vh] space-y-4 pr-2">
          {cartRows.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <p className="text-white/50">购物车是空的</p>
              <p className="text-white/30 text-sm mt-1">快去选购心仪的商品吧</p>
            </div>
          ) : (
            cartRows.map((item) => (
              <div key={item.id} className="flex gap-3 bg-[#242424] rounded-lg p-3">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm line-clamp-2 mb-1">{item.name}</h4>
                  <p className="text-[#4caf50] text-xs mb-2">{item.origin}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#e53935] font-bold">
                      {item.currency}{item.price.toFixed(2)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-white/10 rounded flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-white/10 rounded flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="ml-2 text-white/40 hover:text-[#e53935]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartRows.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">合计:</span>
              <span className="text-[#e53935] text-xl font-bold">NZ${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-[#e53935] hover:bg-[#c62828] text-white h-12">
              去结算
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Bottom Navigation
function BottomNav({ activeTab, cartCount }: { activeTab: string; cartCount: number }) {
  const navItems = [
    { id: 'home', name: '首页', icon: Home },
    { id: 'category', name: '分类', icon: Grid3X3 },
    { id: 'service', name: '客服', icon: Headphones },
    { id: 'cart', name: '购物车', icon: ShoppingCart, badge: cartCount },
    { id: 'profile', name: '我的', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`flex flex-col items-center space-y-1 relative ${
              activeTab === item.id ? 'text-[#e53935]' : 'text-white/50'
            }`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#e53935] text-white text-[10px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

function catalogHintFromStats(stats: CatalogMergeStats | undefined, hasError: boolean): string | null {
  if (!stats || hasError) return null
  const { remoteBannerRows, remoteProductRows, mergedBannerSlides, patchedProductIds } = stats
  if (remoteBannerRows === 0 && remoteProductRows === 0) {
    return '表格接口返回的 banners / products 为空。请确认 Apps 脚本已绑定当前表格，且工作表名称恰好为「Banners」「Products」（区分大小写），且表内有数据行。'
  }
  if (remoteProductRows > 0 && patchedProductIds === 0) {
    return '接口里有商品行，但没有合并进网站：请确认第一列表头为 id 或 编号，且数值与网站商品 id（1–8）一致；origin 须为「新西兰直邮」或「澳洲直邮」，currency 须为「NZ$」或「AU$」。'
  }
  if (remoteBannerRows > 0 && mergedBannerSlides === 0) {
    return '接口里有轮播行，但未使用：请确认 Banners 表有 image 列且图片 URL 非空；active 列勿填 false / 否。'
  }
  return null
}

function catalogSuccessLine(stats: CatalogMergeStats): string {
  const parts: string[] = []
  if (stats.mergedBannerSlides > 0) parts.push(`轮播 ${stats.mergedBannerSlides} 帧`)
  if (stats.patchedProductIds > 0) parts.push(`已合并 ${stats.patchedProductIds} 条商品`)
  if (stats.extraProducts > 0) parts.push(`新增 ${stats.extraProducts} 个商品`)
  if (parts.length === 0) {
    return '已连接表格且接口有数据，但当前合并结果与内置示例相同（可在表格里改 id 为 1 的商品价格做测试）。'
  }
  return `已从 Google 表格同步：${parts.join('；')}。`
}

// Main App
function App() {
  const sheetUrl = import.meta.env.VITE_CATALOG_JSON_URL?.trim()
  const [catalog, setCatalog] = useState<ShopCatalog>(() => structuredClone(defaultShopCatalog))
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogHint, setCatalogHint] = useState<string | null>(null)
  const [mergeStats, setMergeStats] = useState<CatalogMergeStats | null>(null)
  const [lastLoadedSheetUrl, setLastLoadedSheetUrl] = useState<string | null>(null)
  const [catalogFetchTick, setCatalogFetchTick] = useState(0)
  const { banners, products } = catalog
  const [cartLines, setCartLines] = useState<CartLine[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  /** null 表示尚未完成本轮请求（含首次与点击「重新加载」后） */
  const sheetLoading = Boolean(sheetUrl) && lastLoadedSheetUrl !== sheetUrl
  const sheetLoadDone = Boolean(sheetUrl) && lastLoadedSheetUrl === sheetUrl

  useEffect(() => {
    if (!sheetUrl) return
    let cancelled = false
    const base = structuredClone(defaultShopCatalog)
    loadCatalogWithSheetFallback(base, sheetUrl).then(({ catalog: next, error, stats }) => {
      if (cancelled) return
      setCatalog(next)
      setCatalogError(error ?? null)
      setMergeStats(stats ?? null)
      setCatalogHint(catalogHintFromStats(stats, Boolean(error)))
      const ids = new Set(next.products.map((p) => p.id))
      setCartLines((prev) => prev.filter((line) => ids.has(line.id)))
      setLastLoadedSheetUrl(sheetUrl)
    })
    return () => {
      cancelled = true
    }
  }, [sheetUrl, catalogFetchTick])

  const handleRefreshCatalog = () => {
    if (!sheetUrl) return
    setLastLoadedSheetUrl(null)
    setCatalogFetchTick((n) => n + 1)
  }

  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0)

  const handleAddToCart = (product: Product) => {
    setCartLines(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { id: product.id, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCartLines(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const handleRemoveFromCart = (id: number) => {
    setCartLines(prev => prev.filter(item => item.id !== id))
  }

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : activeCategory === 'nz'
    ? products.filter(p => p.origin === '新西兰直邮')
    : activeCategory === 'au'
    ? products.filter(p => p.origin === '澳洲直邮')
    : products

  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-20">
      {/* Header */}
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      {/* Main Content */}
      <main className="pt-14">
        {!sheetUrl && (
          <div className="bg-slate-700/50 text-slate-200 text-center text-xs py-2 px-3 border-b border-white/10 leading-relaxed">
            当前为<strong className="text-white">内置示例数据</strong>（未检测到 VITE_CATALOG_JSON_URL）。若已在 Vercel 填写过该变量，请确认变量名拼写无误并<strong className="text-white"> Redeploy </strong>
            一次，否则构建里不会带上表格地址。
          </div>
        )}
        {sheetUrl && sheetLoading && (
          <div className="bg-sky-900/30 text-sky-100 text-center text-xs py-2 px-4 border-b border-sky-800/30 flex flex-wrap items-center justify-center gap-2">
            <span>正在从表格同步目录…</span>
          </div>
        )}
        {sheetUrl && !sheetLoading && (
          <div className="flex justify-center py-1 border-b border-white/5">
            <button
              type="button"
              onClick={handleRefreshCatalog}
              className="text-[11px] text-sky-300/90 hover:text-sky-200 underline underline-offset-2"
            >
              重新从表格加载
            </button>
          </div>
        )}
        {catalogError && (
          <div className="bg-amber-900/40 text-amber-100 text-center text-xs py-2 px-4 border-b border-amber-700/30">
            {catalogError}
          </div>
        )}
        {catalogHint && (
          <div className="bg-amber-900/35 text-amber-50 text-center text-xs py-2 px-4 border-b border-amber-700/25 leading-relaxed">
            {catalogHint}
          </div>
        )}
        {sheetLoadDone && !catalogError && !catalogHint && mergeStats && (
          <div className="bg-emerald-900/35 text-emerald-100 text-center text-xs py-2 px-4 border-b border-emerald-700/30 leading-relaxed">
            {catalogSuccessLine(mergeStats)}
          </div>
        )}
        {import.meta.env.DEV && sheetUrl && mergeStats && !catalogError && (
          <div className="bg-white/5 text-white/50 text-center text-[11px] py-1.5 px-3 font-mono border-b border-white/5">
            [catalog] banners行={mergeStats.remoteBannerRows} 使用轮播={mergeStats.mergedBannerSlides} ·
            products行={mergeStats.remoteProductRows} 合并id数={mergeStats.patchedProductIds} 新增商品=
            {mergeStats.extraProducts}
          </div>
        )}
        {/* Banner Carousel */}
        <BannerCarousel banners={banners} />

        {/* Category Tabs */}
        <CategoryTabs activeTab={activeCategory} onTabChange={setActiveCategory} />

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-3 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => handleAddToCart(product)}
              />
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center py-6">
          <button className="px-8 py-3 bg-[#242424] text-white/60 rounded-full text-sm hover:bg-[#333] transition-colors">
            加载更多
          </button>
        </div>

        {/* Footer Info */}
        <footer className="bg-[#242424] py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#e53935] to-[#ff6f60] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">NZ</span>
                </div>
                <span className="text-white font-bold text-xl">纽奥康源</span>
              </div>
              <p className="text-white/40 text-sm">新西兰最好的代购服务平台</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="text-[#e53935] font-bold text-lg">100%</div>
                <div className="text-white/40 text-xs">正品保证</div>
              </div>
              <div>
                <div className="text-[#e53935] font-bold text-lg">7-14天</div>
                <div className="text-white/40 text-xs">快速送达</div>
              </div>
              <div>
                <div className="text-[#e53935] font-bold text-lg">24h</div>
                <div className="text-white/40 text-xs">客服在线</div>
              </div>
            </div>

            <div className="text-center text-white/30 text-xs">
              <p>© 2024 纽奥康源 NZHG. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" cartCount={cartCount} />

      {/* Cart Dialog */}
      <CartDialog 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cartLines={cartLines}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
      />
    </div>
  )
}

export default App
