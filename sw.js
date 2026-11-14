/* 施工写真台帳: オフライン対応
   - ページ本体: まずネットから最新を取りに行き、電波が悪ければ(4秒)保存済みのものを表示
   - 部品(アイコン・PDF/Excel作成ライブラリ・フォント): 一度読み込んだら保存したものを使う
   - Gemini(AI)への問い合わせは保存しない
   アプリを更新したときは CACHE の番号を1つ上げる */
const CACHE = "photo-ledger-14";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png?v=2", "./icon-192.png?v=2", "./icon-512.png?v=2"];
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"
];
/* 画面の文字(フォント)の設定。保存がないと、電波が弱いときに画面が出るのを止めてしまう */
const FONT_CSS = "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap";

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })));
    // ライブラリは取れなくてもインストールは止めない(出力するときにも保存される)
    await Promise.all(LIBS.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => {})));
    // フォントの設定も保存(1回開いただけでも、次から電波なしで画面がすぐ出るように)
    await withTimeout(fetch(new Request(FONT_CSS, { mode: "no-cors" })).then((res) => c.put(FONT_CSS, res)), 8000).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("photo-ledger-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function withTimeout(p, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (err) => { clearTimeout(t); reject(err); });
  });
}

async function pageFromCache(req) {
  const c = await caches.open(CACHE);
  return (await c.match("./index.html")) || (await c.match(req, { ignoreSearch: true })) || (await c.match("./"));
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  // このアプリの範囲(scope)の外(同じサイトのほかのアプリ)には手を出さない
  if (sameOrigin && !url.href.startsWith(self.registration.scope)) return;
  const isPage = req.mode === "navigate" || (sameOrigin && /(\/|\/index\.html)$/.test(url.pathname));

  if (isPage) {
    const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin", redirect: "manual" }).then(async (res) => {
      if (res && res.ok) {
        const c = await caches.open(CACHE);
        await c.put("./index.html", res.clone());
      }
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(withTimeout(net, 4000).catch(async () => (await pageFromCache(req)) || net));
    return;
  }

  const cacheable = sameOrigin || /(^|\.)cdnjs\.cloudflare\.com$|^cdn\.jsdelivr\.net$|(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!cacheable) return;

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    if (hit) return hit;
    // 保存がないものはネットから。電波が弱くて返事が来ないときは待ち続けず、先に画面を出す
    // (あとから届いた分は保存しておくので、次に開くときは使える)
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()).catch(() => {});
      return res;
    });
    try { e.waitUntil(net.catch(() => {})); } catch (err) {}
    return withTimeout(net, /^(style|font)$/.test(req.destination) ? 3000 : 8000);
  })());
});
