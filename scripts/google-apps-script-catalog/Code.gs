/**
 * Google 表格 → 网站目录 JSON
 *
 * 用法概要：
 * 1. 新建 Google 表格，建两个工作表，名称须为：Banners、Products（与下方常量一致）。
 * 2. Banners 第一行表头：sort_order, image, alt, active
 *    Products 第一行表头：id, name, price, original_price, image, origin, currency, sold, active
 * 3. 本脚本绑定到该表格：扩展程序 → Apps 脚本，粘贴此文件并保存。
 * 4. 部署：部署 → 新建部署 → 类型选「Web 应用」→ 执行身份选「我」→ 具有访问权限的用户选「任何人」
 *    （仅读取表格时这样即可；若表格含隐私可改为「任何人 / Google 账号」并配合前端鉴权）。
 * 5. 复制 Web 应用 URL，写入前端环境变量 VITE_CATALOG_JSON_URL，重新构建/启动。
 *
 * 图片 URL：可填完整 https 链接，或站点上的路径如 /banner-1.jpg
 */
var SHEET_BANNERS = 'Banners';
var SHEET_PRODUCTS = 'Products';

function rowObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    var empty = true;
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;
      var cell = row[c];
      if (cell !== '' && cell !== null && cell !== undefined) empty = false;
      obj[key] = cell;
    }
    if (!empty) out.push(obj);
  }
  return out;
}

function getCatalogJson_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bannersSh = ss.getSheetByName(SHEET_BANNERS);
  var productsSh = ss.getSheetByName(SHEET_PRODUCTS);
  var banners = bannersSh ? rowObjects_(bannersSh) : [];
  var products = productsSh ? rowObjects_(productsSh) : [];
  return { banners: banners, products: products };
}

/** 供「测试部署」在浏览器中打开 */
function doGet() {
  return ContentService.createTextOutput(JSON.stringify(getCatalogJson_()))
    .setMimeType(ContentService.MimeType.JSON);
}
