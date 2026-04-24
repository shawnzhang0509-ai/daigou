/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 部署为 Web 应用的 Apps Script 地址，返回 { banners, products } JSON */
  readonly VITE_CATALOG_JSON_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
