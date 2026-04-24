# 澳新康源（Vite + React）

## 用 Google 表格当「后台」

1. 表格里两个工作表名须为 **`Banners`**、**`Products`**，表头与 `scripts/google-apps-script-catalog/Code.gs` 顶部说明一致。
2. 把 Apps Script **Web 应用** 的地址填进环境变量 **`VITE_CATALOG_JSON_URL`**（不要提交到 Git）。
3. **本地开发**：在项目根目录新建 **`.env.local`**（已加入 `.gitignore`），写入一行  
   `VITE_CATALOG_JSON_URL=https://script.google.com/macros/s/你的部署ID/exec`  
   保存后执行 **`npm run dev`**，浏览器强制刷新。
4. **本地打包预览**：同上变量可写在 **`.env.production.local`**，再执行 **`npm run build`** 与 **`npm run preview`**。
5. **线上网站（GitHub Pages / Vercel 等）**：在托管平台的 **Environment variables / Secrets** 里添加同名变量 `VITE_CATALOG_JSON_URL`，值为你的 Web 应用 URL，然后 **重新触发一次构建部署**。仅在自己电脑配置不会更新线上。

更多细节见 `.env.example` 与 `scripts/google-apps-script-catalog/Code.gs`。

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
