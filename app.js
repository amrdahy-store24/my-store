const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let me = null, offer = null, cat = '', products = [], cart = JSON.parse(localStorage.getItem('cart') || '[]'), flash = '';
async function api(url, method = 'GET', data) {
  const r = await fetch(url, { method, headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) { const e = new Error(j.error || 'حصل خطأ'); e.capReq = !!j.captchaRequired; e.pkOnly = !!j.passkeyOnly; e.pkTicket = j.ticket || ''; throw e; } return j;
}
const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
const msg = (t, c = 'err') => `<div class="msg ${c}">${esc(t)}</div>`;
const P = { home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>', cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a1 1 0 001 .8h9.2a1 1 0 001-.8L21 7H6"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>', plus: '<circle cx="10" cy="8" r="4"/><path d="M2 21c0-4 3.4-6.5 8-6.5"/><path d="M18 14v6M15 17h6"/>', box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>', out: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>', truck: '<path d="M1 4h13v12H1zM14 8h4l3 3v5h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>', cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 10v4M18 10v4"/>', shield: '<path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L16 9.5"/>', trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>', bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>', spark: '<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>', lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>' };
const ic = (n, z = 20) => `<svg width="${z}" height="${z}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const money = n => Number(n).toLocaleString('en-US');
const grads = ['#6d5efc,#8b7bff', '#0ea5a4,#34d399', '#f59e0b,#fb7185', '#2563eb,#38bdf8', '#db2777,#f472b6', '#7c3aed,#c084fc'];
const ph = id => `background:linear-gradient(135deg,${grads[id % grads.length]})`;
const imgStyle = p => p.image ? `background-image:url('${esc(p.image)}')` : ph(p.id);
const imgIn = p => p.image ? '' : ic('bag', 46);
let view = 'shop';
const SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>';
function paintTheme() { const d = document.documentElement.getAttribute('data-theme') === 'dark'; const b = $('#tg'); if (b) { b.innerHTML = d ? SUN : MOON; b.title = d ? 'الوضع الفاتح' : 'الوضع الداكن'; } }
function toggleTheme() { const d = document.documentElement.getAttribute('data-theme') === 'dark'; if (d) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', 'dark'); try { localStorage.setItem('theme', d ? 'light' : 'dark'); } catch {} paintTheme(); }
paintTheme();
let cfg = { ownerWhatsapp: '' }; fetch('/api/config').then(r => r.json()).then(c => { cfg = c; }).catch(() => {});
const WM = (cls = '') => `<span class="wm ${cls}" dir="ltr">tekm<svg viewBox="0 0 150 90" aria-hidden="true"><circle cx="45" cy="45" r="30" fill="none" stroke="url(#tkg)" stroke-width="12"/><circle cx="105" cy="45" r="30" fill="none" stroke="url(#tkg)" stroke-width="12"/></svg></span>`;
function nav() {
  const b = (v, ic, t, x = '') => `<button class="${view === v ? 'on' : ''}" onclick="go('${v}')"><span class="ic">${ic}</span><span class="t">${t}</span>${x}</button>`;
  $('#nav').innerHTML = b('shop', ic('home'), 'الرئيسية') + b('cart', ic('cart'), 'السلة', cartCount() ? `<span class="badge">${cartCount()}</span>` : '') +
    (me ? (me.role === 'admin' ? b('admin', ic('gear'), 'لوحة التحكم') : b('orders', ic('box'), 'طلباتي')) : b('login', ic('user'), 'دخول')) +
    `<button class="${menuOpen ? 'on' : ''}" onclick="toggleMenu()" aria-label="القائمة" aria-expanded="${menuOpen}"><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span><span class="t">القائمة</span></button>`;
  const fw = $('#fwm'); if (fw && !fw.innerHTML) fw.innerHTML = WM('big');
}
let menuOpen = false;
function closeMenu() { menuOpen = false; const m = $('#menu'); if (m) m.remove(); nav(); }
function toggleMenu() { if (menuOpen) return closeMenu(); menuOpen = true; renderMenu(); nav(); }
function menuGo(v, arg) { closeMenu(); go(v, arg); }
function menuCat(c) { closeMenu(); go('shop').then(() => { setCat(c); const el = document.getElementById('prods'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }); }
function renderMenu() {
  const old = $('#menu'); if (old) old.remove();
  const dark = document.documentElement.getAttribute('data-theme') === 'dark', wa = String(cfg.ownerWhatsapp || '').replace(/\D/g, '');
  const row = (ico, t, oc, sub = '') => `<button class="mi" onclick="${oc}"><span class="mic">${ic(ico, 20)}</span><span class="mt">${t}${sub ? `<small>${sub}</small>` : ''}</span></button>`;
  const link = (ico, t, href, sub = '') => `<a class="mi" href="${href}" target="_blank" rel="noopener"><span class="mic">${ic(ico, 20)}</span><span class="mt">${t}${sub ? `<small dir="ltr">${sub}</small>` : ''}</span></a>`;
  const cl = cats();
  const acc = me ? `<div class="mu"><b>${esc(me.username)}</b></div>${row('box', 'طلباتي', "menuGo('orders')")}${me.role === 'admin' ? row('gear', 'لوحة التحكم', "menuGo('admin')") : ''}${row('out', 'تسجيل الخروج', 'closeMenu();logout()')}`
    : `<p class="mhint">سجّل الدخول أو أنشئ حساب</p>${row('user', 'دخول', "menuGo('login')")}${row('plus', 'حساب جديد', "menuGo('register')")}`;
  const el = document.createElement('div'); el.id = 'menu';
  el.innerHTML = `<div class="mov" onclick="closeMenu()"></div><aside class="msh" role="dialog" aria-label="القائمة"><div class="mh">${WM()}<button class="mx" onclick="closeMenu()" aria-label="إغلاق">✕</button></div>
  <div class="ms"><h4>حسابي</h4>${acc}</div>
  <div class="ms"><h4>الأقسام</h4>${cl.length ? `<div class="mch"><button onclick="menuCat('')">الكل</button>${cl.map(c => `<button onclick="menuCat(this.dataset.c)" data-c="${esc(c.id)}">${esc(c.name)}</button>`).join('')}</div>` : '<p class="mhint">مفيش أقسام لسه</p>'}</div>
  ${installCard('menu')}<div class="ms"><h4>الدعم الفني</h4>${wa ? link('spark', 'محتاج مساعدة؟ كلّمنا واتساب', `https://wa.me/${wa}?text=${encodeURIComponent('محتاج مساعدة في المتجر')}`) : ''}</div>
  <div class="ms"><h4>تواصل معنا</h4>${wa ? link('user', 'واتساب', `https://wa.me/${wa}`, '+' + wa) + link('truck', 'اتصال', `tel:+${wa}`, '+' + wa) : ''}</div>
  <div class="ms"><h4>الإعدادات</h4><div class="mset"><span>اللغة</span><div class="seg"><button class="${LANG === 'ar' ? 'on' : ''}" onclick="setLang('ar')">العربية</button><button class="${LANG === 'en' ? 'on' : ''}" onclick="setLang('en')">English</button></div></div>
  <div class="mset"><span>الدولة</span><select class="csel" onchange="setCountry(this.value)">${cOpts(COUNTRY)}</select></div>
  <div class="mset"><span>المظهر</span><div class="seg"><button class="${dark ? '' : 'on'}" onclick="setTheme(false)">فاتح</button><button class="${dark ? 'on' : ''}" onclick="setTheme(true)">داكن</button></div></div></div></aside>`;
  document.body.appendChild(el);
}
function setTheme(d) { if (d === (document.documentElement.getAttribute('data-theme') === 'dark')) return; toggleTheme(); if (menuOpen) renderMenu(); }
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; const cs = document.getElementById('catsheet'); if (cs) return cs.remove(); if (menuOpen) closeMenu(); });
let dataAt = 0, dataSig = '';
async function loadData() {
  const [p, o] = await Promise.all([api('/api/products?c=' + COUNTRY + (me && me.role === 'admin' ? '&all=1' : '')).catch(() => null), api('/api/offer').catch(() => null)]);
  if (p) products = p.products; if (o) offer = o.offer; dataAt = Date.now();
  const sig = JSON.stringify([products, offer]); const ch = dataSig && sig !== dataSig; dataSig = sig; return ch;
}
function refreshBg() { dataAt = Date.now(); loadData().then(ch => { if (ch && ['shop', 'prod', 'cart'].includes(view) && !document.activeElement?.matches?.('input,textarea') && !document.getElementById('menu')) go(view, curArg, true); }).catch(() => {}); }
let curArg;
async function go(v, arg, quiet) {
  curArg = arg;
  if (!dataAt || v === 'admin') await loadData(); else if (!quiet && Date.now() - dataAt > 15000 && v !== 'login' && v !== 'register' && v !== 'forgot') refreshBg();
  const ch = v !== view; view = v; nav(); const f = flash; flash = '';
  if (v === 'shop') return shop(f);
  if (v === 'prod') return prodView(f, arg);
  if (v === 'cart') return cartView(f);
  if (v === 'login' || v === 'register') return authView(v, f);
  if (v === 'forgot') return forgotView(f);
  if (v === 'orders') return ordersView(f).then(pkPanel);
  if (v === 'admin') return loadData().catch(() => {}).then(() => adminView(f, arg)).then(chAdminPanel).then(pkPanel);
}
const CATS = (typeof window !== 'undefined' && window.CATEGORIES) || [];
const CATN = {}; CATS.forEach(c => { CATN[c.id] = { id: c.id, name: c.name, parent: '' }; c.children.forEach(s => { CATN[s.id] = { id: s.id, name: s.name, parent: c.id }; }); });
const catName = id => (CATN[id] ? CATN[id].name : '');
const catPath = id => { const n = CATN[id]; if (!n) return ''; return n.parent ? CATN[n.parent].name + ' › ' + n.name : n.name; };
const catIds = id => { const s = new Set([id]); for (const k of Object.keys(CATN)) if (CATN[k].parent === id) s.add(k); return s; };
const catHas = (p, id) => !id || p.cat === id || (CATN[id] && !CATN[id].parent && p.cat && CATN[p.cat] && CATN[p.cat].parent === id);
const catTree = () => CATS.map(c => ({ id: c.id, name: c.name, n: pv().filter(p => catHas(p, c.id)).length, kids: c.children.map(s => ({ id: s.id, name: s.name, n: pv().filter(p => p.cat === s.id).length })).filter(k => k.n) })).filter(c => c.n);
function chipHtml() {
  const tops = catTree(), top = cat ? (CATN[cat] && CATN[cat].parent ? CATN[cat].parent : cat) : '', tn = top ? CATS.find(c => c.id === top) : null;
  const kids = tn ? tn.children.map(s => ({ id: s.id, name: s.name, n: pv().filter(p => p.cat === s.id).length })).filter(k => k.n) : [];
  return `<div class="chips"><button class="chip${cat ? '' : ' on'}" data-c="" onclick="setCat('')">الكل</button>${tops.map(c => `<button class="chip${cat === c.id ? ' on' : ''}" data-c="${c.id}" onclick="setCat(this.dataset.c)">${esc(c.name)}</button>`).join('')}</div>` +
    (kids.length ? `<div class="chips sub"><button class="chip2${cat === top ? ' on' : ''}" data-c="${top}" onclick="setCat(this.dataset.c)">كل ${esc(tn.name)}</button>${kids.map(k => `<button class="chip2${cat === k.id ? ' on' : ''}" data-c="${k.id}" onclick="setCat(this.dataset.c)">${esc(k.name)}</button>`).join('')}</div>` : '');
}
function filt() { const q = ($('#q') ? $('#q').value : '').trim().toLowerCase(); const ids = cat ? catIds(cat) : null; document.querySelectorAll('.card').forEach(c => c.style.display = c.dataset.s.includes(q) && (!ids || ids.has(c.dataset.c)) ? '' : 'none'); }
function setCat(c) { cat = c || ''; const el = $('#chips'); if (el) el.innerHTML = chipHtml(); filt(); }
const vis = p => cPrice(p) != null, pv = () => (view === 'admin' ? products : products.filter(vis));
const cats = () => catTree();
let slI = 0, slT = null;
function slGo(n) { const s = document.querySelectorAll('.slider .slide'); if (!s.length) return; slI = (n + s.length) % s.length; s.forEach((e, i) => e.classList.toggle('on', i === slI)); document.querySelectorAll('.slider .dot').forEach((e, i) => { e.classList.toggle('on', i === slI); e.setAttribute('aria-current', i === slI); }); }
function slStart() { clearInterval(slT); const el = document.querySelector('.slider'); if (!el || el.querySelectorAll('.slide').length < 2 || matchMedia('(prefers-reduced-motion:reduce)').matches) return; slT = setInterval(() => { const e = document.querySelector('.slider'); if (!e) { clearInterval(slT); return; } if (e.classList.contains('pz')) return; slGo(slI + 1); }, 5000); }
let slX = 0;
function sliderHtml() {
  const items = offer && offer.on ? String(offer.text || '').split('\n').map(s => s.trim()).filter(Boolean) : [];
  const go = "document.getElementById('prods').scrollIntoView({behavior:'smooth'})";
  const hero = `<section class="slide hero on"><span class="pill">● تشكيلة جديدة وصلت</span><h2>تسوّق <em>أحلى المنتجات</em><br>بسعر وجودة تستاهلها</h2><p>اختار اللي يعجبك، اطلب في دقيقة، والدفع عند الاستلام لحد باب بيتك.</p><button class="cta" onclick="${go}">تصفّح المنتجات ←</button></section>`;
  const offs = items.map(t => `<section class="slide offer"><span class="pill">${ic('spark', 14)} ${esc(offer.title || 'عرض')}</span><h3>${esc(t)}</h3><button class="cta" onclick="${go}">تسوّق العرض ←</button></section>`).join('');
  if (!items.length) return `<div class="slider">${hero}</div>`;
  const n = items.length + 1;
  return `<div class="slider" role="region" aria-roledescription="carousel" aria-label="العروض" onmouseenter="this.classList.add('pz')" onmouseleave="this.classList.remove('pz')" onfocusin="this.classList.add('pz')" onfocusout="this.classList.remove('pz')" ontouchstart="slX=event.touches[0].clientX;this.classList.add('pz')" ontouchend="const d=event.changedTouches[0].clientX-slX;if(Math.abs(d)>40)slGo(slI+(d<0?1:-1));setTimeout(()=>this.classList.remove('pz'),3000)"><div class="sl">${hero}${offs}</div><button class="arr nx" aria-label="السابق" onclick="slGo(slI-1)">${'›'}</button><button class="arr pv" aria-label="التالي" onclick="slGo(slI+1)">${'‹'}</button><div class="dots">${Array.from({ length: n }, (_, j) => `<button class="dot${j ? '' : ' on'}" aria-label="شريحة ${j + 1}" onclick="slGo(${j})"></button>`).join('')}</div></div>`;
}
let inst = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); inst = e; repaintInstall(); });
addEventListener('appinstalled', () => { inst = null; try { localStorage.setItem('pwaHide', '1'); } catch {} repaintInstall(); });
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const pwaHidden = () => { try { return localStorage.getItem('pwaHide') === '1'; } catch { return false; } };
function repaintInstall() { const el = document.getElementById('pwa'); if (el) el.outerHTML = installCard(); const mi = document.getElementById('pwaMenu'); if (mi) mi.outerHTML = installCard('menu'); }
function installCard(where) {
  if (standalone() || pwaHidden()) return '';
  const ios = isIOS();
  if (where === 'menu') return `<div class="ms" id="pwaMenu"><h4>التطبيق</h4><button class="mi" onclick="closeMenu();pwaInstall()"><span class="mic">${ic('plus', 20)}</span><span class="mt">ثبّت تِكمو على شاشتك<small>${ios ? 'أيقونة على الشاشة الرئيسية' : 'يفتح بضغطة واحدة وأسرع'}</small></span></button></div>`;
  return `<div class="pwa" id="pwa"><span class="pwi"><img src="icon-192.png?v=34" alt="" width="44" height="44"></span><div class="pwt"><b>ثبّت تِكمو على شاشتك</b><small>${ios ? 'اضغط تثبيت وورينا الخطوات' : 'يفتح بضغطة واحدة من غير متصفح'}</small></div><button class="btn pwb" onclick="pwaInstall()">تثبيت</button><button class="pwx" onclick="pwaHide()" aria-label="إخفاء">✕</button></div>`;
}
async function pwaInstall() {
  if (inst) { try { inst.prompt(); await inst.userChoice; } catch {} inst = null; repaintInstall(); return; }
  showInstallHelp();
}
function pwaHide() { try { localStorage.setItem('pwaHide', '1'); } catch {} const el = document.getElementById('pwa'); if (el) el.remove(); }
function showInstallHelp() {
  const old = document.getElementById('pwahint'); if (old) old.remove();
  const steps = isIOS()
    ? ['اضغط زر المشاركة ⬆️ تحت في المتصفح', 'اختار «إضافة إلى الشاشة الرئيسية»', 'اضغط «إضافة» — أيقونة تِكمو هتظهر على شاشتك']
    : ['افتح قائمة المتصفح ⋮ فوق على اليمين', 'اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»', 'اضغط «تثبيت» — أيقونة تِكمو هتظهر على شاشتك'];
  const el = document.createElement('div'); el.id = 'pwahint';
  el.innerHTML = `<div class="mov" onclick="document.getElementById('pwahint').remove()"></div><div class="cpanel" role="dialog" aria-label="تثبيت التطبيق"><div class="ctop"><b>ثبّت تِكمو على شاشتك</b><button class="mx" onclick="document.getElementById('pwahint').remove()" aria-label="إغلاق">✕</button></div><div class="clist">${steps.map((t, i) => `<div class="ci"><span>${i + 1}. ${esc(t)}</span></div>`).join('')}</div></div>`;
  document.body.appendChild(el);
}
function shop(f) {
  slI = 0; setTimeout(slStart, 0); $('#app').innerHTML = f + sliderHtml() + `<div class="perks">${['truck', 'cash', 'shield'].map(k => `<button class="perk" onclick="perkOpen('${k}',this)" aria-haspopup="dialog"><i>${ic(PK[k].i, 26)}</i><b>${chL(PK[k].a, PK[k].e)}</b></button>`).join('')}</div>
  ${installCard()}<div class="sh" id="prods"><h3>المنتجات<span>${pv().length} منتج</span></h3><div class="search"><input id="q" placeholder="ابحث عن منتج..." oninput="filt()"></div></div><div id="chips">${chipHtml()}</div>` +
  (pv().length ? `<div class="grid">${pv().map(p => `<div class="card" onclick="cardTap(event,this,${p.id})" data-c="${esc(p.cat || '')}" data-s="${esc((p.name + ' ' + p.description).toLowerCase())}"><div class="img ${p.image ? '' : 'ph'}" style="${imgStyle(p)}">${imgIn(p)}${p.stock < 1 ? '<span class="tag out">نفذت الكمية</span>' : p.stock <= 3 ? `<span class="tag low">باقي ${p.stock} فقط</span>` : ''}</div>
  <div class="b"><div class="nm">${esc(p.name)}</div><div class="small">${esc(p.description)}</div><div class="price">${money(cPrice(p))}<small>${sym()}</small></div>
  <button class="btn" ${p.stock < 1 ? 'disabled' : ''} onclick="event.stopPropagation();addCart(${p.id})">${p.stock < 1 ? 'غير متاح' : ic('cart', 16) + ' أضف للسلة'}</button></div></div>`).join('')}</div>` : `<div class="panel empty"><div class="e">${ic('bag', 56)}</div>مفيش منتجات حاليًا، ارجع قريب.</div>`);
  if (cat) filt();
}
let after = null;
function needLogin(next, text) { after = next; flash = msg(text); go('login'); }
function openProd(id) { if (!me) return needLogin({ v: 'prod', a: id }, 'سجّل دخولك الأول عشان تشوف تفاصيل المنتج'); go('prod', id); }
function addCart(id, back) {
  if (!me) return needLogin({ v: 'prod', a: id }, 'لازم تسجّل دخول الأول عشان تطلب');
  const p = products.find(x => x.id === id && vis(x)), it = cart.find(x => x.id === id), q = (it ? it.qty : 0) + 1;
  if (!p || q > p.stock) { flash = msg('وصلت للحد الأقصى المتاح من المنتج ده'); return back ? go('prod', id) : go('shop'); }
  if (it) it.qty = q; else cart.push({ id, qty: 1 }); saveCart(); flash = msg('اتضاف للسلة ✓', 'ok'); back ? go('prod', id) : go('shop');
}
function prodView(f, id) {
  const p = products.find(x => x.id === id && vis(x));
  if (!p) { flash = msg('المنتج مش موجود'); return go('shop'); }
  const lines = String(p.description || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const specs = lines.filter(l => /^[^:：]{1,30}[:：]\s*\S/.test(l)).map(l => l.split(/[:：]/)), desc = lines.filter(l => !/^[^:：]{1,30}[:：]\s*\S/.test(l));
  const st = p.stock < 1 ? '<span class="stk o">نفذت الكمية</span>' : p.stock <= 3 ? `<span class="stk l">باقي ${p.stock} فقط</span>` : '<span class="stk g">متوفر</span>';
  $('#app').innerHTML = f + `<a class="back" onclick="go('shop')">→ رجوع للمنتجات</a><div class="pd"><div class="pdi ${p.image ? '' : 'ph'}" style="${imgStyle(p)}">${imgIn(p)}</div>
  <div class="pdb">${p.cat ? `<button class="catpill" onclick="menuCat('${esc(p.cat)}')">${esc(catPath(p.cat))}</button>` : ''}<h1>${esc(p.name)}</h1><div class="pdp">${cPrice(p) == null ? '<small>غير متاح في ' + cnm(COUNTRY) + ' حاليًا</small>' : money(cPrice(p)) + '<small>' + sym() + '</small>'}</div>${st}
  ${desc.length ? `<h4>الوصف</h4><p class="pdd">${desc.map(esc).join('<br>')}</p>` : ''}
  ${specs.length ? `<h4>المواصفات</h4><table class="spec">${specs.map(r => `<tr><th>${esc(r[0].trim())}</th><td>${esc(r.slice(1).join(':').trim())}</td></tr>`).join('')}</table>` : ''}
  <div class="cod" style="margin:14px 0">${ic('cash', 18)} الدفع عند الاستلام</div>
  <button class="btn wide" ${p.stock < 1 || cPrice(p) == null ? 'disabled' : ''} onclick="addCart(${p.id}, true)">${p.stock < 1 ? 'غير متاح' : ic('cart', 16) + ' أضف للسلة'}</button>
  <button class="btn wide ghost" style="margin-top:8px" onclick="go('cart')">عرض السلة</button></div></div>`;
}
const CNT = { EG: { ar: 'مصر', en: 'Egypt', sym: 'ج.م' }, SA: { ar: 'السعودية', en: 'Saudi Arabia', sym: 'ر.س' }, AE: { ar: 'الإمارات', en: 'UAE', sym: 'د.إ' }, IQ: { ar: 'العراق', en: 'Iraq', sym: 'د.ع' }, OM: { ar: 'عُمان', en: 'Oman', sym: 'ر.ع' } };
let COUNTRY = (() => { try { const c = localStorage.getItem('country'); return CNT[c] ? c : 'EG'; } catch { return 'EG'; } })();
const sym = () => CNT[COUNTRY].sym, cnm = c => LANG === 'en' ? CNT[c].en : CNT[c].ar;
const cPrice = p => COUNTRY === 'EG' ? p.price : (p.prices && +p.prices[COUNTRY] > 0 ? +p.prices[COUNTRY] : null);
const cm = n => money(n) + ' ' + sym();
const cOpts = sel => Object.keys(CNT).map(c => `<option value="${c}"${c === sel ? ' selected' : ''}>${esc(cnm(c))}</option>`).join('');
function regCountry(c) { if (!CNT[c]) return; COUNTRY = c; try { localStorage.setItem('country', c); } catch {} const ph = $('#ph'); if (ph) ph.placeholder = c === 'EG' ? '01xxxxxxxxx' : '+9665xxxxxxxx'; CH.hist = []; loadData().catch(() => {}); }
function setCountry(c) { if (!CNT[c]) return; COUNTRY = c; try { localStorage.setItem('country', c); } catch {} CH.hist = []; closeMenu(); loadData().catch(() => {}).then(() => go(view === 'prod' && !products.some(p => p.id === curArg && vis(p)) ? 'shop' : view, curArg, true)); }
let SHIPC = null;
const regList = () => COUNTRY === 'EG' ? shipAreas().map(o => ({ n: o.n, fee: o.fee })) : ((SHIPC && SHIPC[COUNTRY] && SHIPC[COUNTRY].regions) || []);
const areaSel = () => `<label>${COUNTRY === 'EG' ? 'المحافظة / المنطقة' : 'المنطقة'}</label><select id="area" onchange="shipPick(this.value)"><option value="">اختار...</option>${regList().map(o => `<option value="${esc(o.n)}"${o.n === shipSel() ? ' selected' : ''}>${esc(o.n)} - ${cm(o.fee)}</option>`).join('')}</select>`;
let SHIP = null; const shipLoad = () => api('/api/shipping').then(r => { SHIP = r.tiers; SHIPC = r.countries; if (view === 'cart') go('cart'); }).catch(() => {});
const shipAreas = () => (SHIP || []).flatMap(t => t.areas.map(n => ({ n, fee: t.fee }))).sort((x, y) => x.n.localeCompare(y.n, 'ar'));
const shipSel = () => { try { return localStorage.getItem('area') || ''; } catch { return ''; } };
function shipPick(v) { try { if (v) localStorage.setItem('area', v); } catch {} const t = +($('#subt') || {}).dataset.v || 0; const x = regList().find(o => o.n === v), fee = x ? x.fee : null;
  $('#shipv').textContent = fee != null ? cm(fee) : (regList().length ? ($('#area') ? 'اختار المنطقة' : 'يتحدد عند التأكيد') : (COUNTRY === 'EG' ? 'يتحدد عند التأكيد' : 'هيتحدد قريب')); $('#totv').textContent = cm(t + (fee || 0)); }
function cartView(f) {
  if (!SHIP) { shipLoad(); }
  cart = cart.filter(i => products.some(p => p.id === i.id && vis(p))); saveCart(); nav();
  if (!cart.length) return $('#app').innerHTML = f + `<div class="panel empty"><div class="e">${ic('cart', 56)}</div><h2>السلة فاضية</h2><button class="btn" onclick="go(\'shop\')">ابدأ التسوّق</button></div>`;
  const rows = cart.map(i => { const p = products.find(x => x.id === i.id); return `<div class="ci"><div class="im" style="${imgStyle(p)}">${imgIn(p)}</div>
  <div><b>${esc(p.name)}</b><div class="p">${cPrice(p) == null ? 'غير متاح في ' + cnm(COUNTRY) : cm(cPrice(p))} للقطعة</div><div class="stp" style="margin-top:6px"><button onclick="setQty(${i.id},${i.qty + 1})">+</button><span>${i.qty}</span><button onclick="setQty(${i.id},${i.qty - 1})">−</button></div></div>
  <div><div class="tot">${cm((cPrice(p) || 0) * i.qty)}</div><button class="rm" onclick="setQty(${i.id},0)">${ic('trash', 14)} حذف</button></div></div>`; }).join('');
  const total = cart.reduce((s, i) => s + (cPrice(products.find(x => x.id === i.id)) || 0) * i.qty, 0); const bad = cart.some(i => cPrice(products.find(x => x.id === i.id)) == null);
  $('#app').innerHTML = f + `<h2 style="margin:6px 0 14px;font-weight:800">سلة المشتريات</h2><div class="cartwrap"><div class="panel">${rows}</div><div class="panel sum"><h2>ملخص الطلب</h2>
  <div class="ln"><span>عدد القطع</span><span>${cartCount()}</span></div><div class="ln"><span>المنتجات</span><span id="subt" data-v="${total}">${cm(total)}</span></div><div class="ln"><span>التوصيل</span><span id="shipv">اختار المحافظة</span></div><div class="ln big"><span>الإجمالي</span><span id="totv">${cm(total)}</span></div>
  ${me ? `<div id="m"></div>${COUNTRY !== 'EG' && !regList().length ? '<p class="small" style="color:var(--bad,#c33)">الطلب لـ' + cnm(COUNTRY) + ' لسه مش متاح، كلّم حد على واتساب.</p>' : ''}${areaSel()}<label>العنوان</label><input id="addr" placeholder="المدينة، الشارع، رقم العمارة"><label>رقم التليفون</label><input id="ph" inputmode="tel" dir="ltr" style="text-align:right" placeholder="${COUNTRY === 'EG' ? '01xxxxxxxxx' : '+9665xxxxxxxx'}"><div class="cod">${ic('cash', 18)} الدفع عند الاستلام</div>${bad ? `<p class="small" style="color:var(--bad,#c33)">فيه منتج في السلة مش متاح في ${cnm(COUNTRY)} حاليًا، احذفه عشان تكمل.</p>` : ''}<button class="btn wide" ${bad || (COUNTRY !== 'EG' && !regList().length) ? 'disabled' : ''} onclick="checkout()">تأكيد الطلب</button>`
       : '<p class="small">لازم تسجل دخول عشان تكمل الطلب.</p><button class="btn wide" onclick="go(\'login\')">دخول</button>'}</div></div>`;
  shipPick(($('#area') || {}).value || '');
}
function setQty(id, q) { q = parseInt(q, 10) || 0; const p = products.find(x => x.id === id);
  if (q > p.stock) { q = p.stock; flash = msg('الكمية المتاحة ' + p.stock + ' فقط'); }
  cart = q > 0 ? cart.map(i => i.id === id ? { ...i, qty: q } : i) : cart.filter(i => i.id !== id); saveCart(); go('cart'); }
async function checkout() {
  try { await api('/api/orders', 'POST', { items: cart, country: COUNTRY, area: ($('#area') || {}).value, address: $('#addr').value, phone: $('#ph').value });
    cart = []; saveCart(); flash = msg('تم تسجيل طلبك بنجاح ✓ هنتواصل معاك قريب', 'ok'); go('orders'); } catch (e) { $('#m').innerHTML = msg(e.message); }
}
async function loadCap() { const el = document.getElementById('cap'); if (!el) return; try { const c = await api('/api/captcha'); window.capTok = c.token; el.innerHTML = c.svg + '<button type="button" class="caprf" onclick="loadCap()" aria-label="تحديث">↻</button>'; const i = document.getElementById('cp'); if (i) i.value = ''; } catch (e) { el.textContent = 'تعذّر تحميل الكود، اضغط تحديث'; } }
function authView(v, f) {
  const reg = v === 'register'; if (!reg) setTimeout(() => pkAvail().then(ok => { const b = $('#pkb'); if (b && ok) b.style.display = ''; }), 0);
  $('#app').innerHTML = `<div class="panel narrow"><div class="ai">${WM('big')}</div><h2>${reg ? 'إنشاء حساب جديد' : 'أهلاً بيك تاني'}</h2><p class="small" style="margin-top:-8px">${reg ? 'سجّل في ثواني وابدأ اطلب' : 'سجّل دخولك عشان تكمل طلباتك'}</p>${f}<div id="m"></div><label>${reg ? 'اسم المستخدم' : 'اسم المستخدم أو رقم الموبايل'}</label><input id="u" autocomplete="username" autocapitalize="none">
  ${reg ? `<label>الدولة</label><select id="cn" onchange="regCountry(this.value)">${cOpts(COUNTRY)}</select><label>رقم الموبايل</label><input id="ph" inputmode="tel" autocomplete="tel" dir="ltr" style="text-align:right" placeholder="${COUNTRY === 'EG' ? '01xxxxxxxxx' : '+9665xxxxxxxx'}">` : ''}<label>الباسورد</label><input id="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}"><div id="capw" ${reg ? '' : 'style="display:none"'}><label>كود التحقق (عشان نتأكد إنك مش روبوت)</label><div class="cap" id="cap"></div><input id="cp" onkeydown="if(event.key==='Enter')auth(\'${v}\')" autocomplete="off" autocapitalize="characters" maxlength="8" placeholder="اكتب الحروف اللي في الصورة" dir="ltr" style="text-align:center;letter-spacing:3px"></div>
  ${reg ? '' : '<label class="rmb"><input type="checkbox" id="rm"><span>تذكرني</span></label>'}
  ${reg ? '' : '<button class="btn wide ghost" id="pkb" style="display:none;margin-bottom:8px" onclick="pkLogin()">🔐 الدخول بالبصمة (من غير كود تحقق)</button>'}
  ${reg ? '' : '<div class="alt" id="enw" style="display:none;margin-bottom:8px"><a onclick="pkEnroll()" style="font-weight:800">➕ إضافة بصمة على الجهاز ده (بكلمة سر الأدمن)</a></div>'}
  <button class="btn wide" onclick="auth('${v}')">${reg ? 'إنشاء الحساب' : 'دخول'}</button>
  ${reg ? '' : '<div class="alt" style="margin-top:10px"><a onclick="go(\'forgot\')">نسيت الباسورد؟</a></div>'}
  <div class="alt">${reg ? 'عندك حساب؟ <a onclick="go(\'login\')">سجّل دخول</a>' : 'مش عندك حساب؟ <a onclick="go(\'register\')">أنشئ حساب</a>'}</div></div>`;
  if (reg) loadCap(); else { try { const ru = localStorage.getItem('ru'); if (ru) { $('#u').value = ru; $('#rm').checked = true; setTimeout(() => $('#p') && $('#p').focus(), 50); } } catch {} }
}
const pkB = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), pkU = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '==='.slice((s.length + 3) % 4); return Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer; };
const pkAvail = async () => { try { return !!(window.PublicKeyCredential && navigator.credentials && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch { return false; } };
async function afterLogin(user) {
  me = user; if (me.country && CNT[me.country]) { COUNTRY = me.country; try { localStorage.setItem('country', me.country); } catch {} } CH.hist = []; await loadData().catch(() => {}); flash = msg('أهلاً ' + me.username, 'ok'); const a = after; after = null; if (a && me.role !== 'admin') go(a.v, a.a); else go(me.role === 'admin' ? 'admin' : 'shop');
}
async function pkLogin() {
  try {
    const o = await api('/api/passkey/login/options', 'POST', {}), pk = o.publicKey; pk.challenge = pkU(pk.challenge);
    const c = await navigator.credentials.get({ publicKey: pk });
    const r = await api('/api/passkey/login/verify', 'POST', { cid: o.cid, credential: { id: c.id, response: { clientDataJSON: pkB(c.response.clientDataJSON), authenticatorData: pkB(c.response.authenticatorData), signature: pkB(c.response.signature) } } });
    await afterLogin(r.user);
  } catch (e) { const m = $('#m'); if (m) m.innerHTML = msg(e && e.name === 'NotAllowedError' ? 'اتلغت العملية أو مفيش بصمة متسجلة على الجهاز ده. سجّل دخول عادي وفعّل البصمة من حسابك.' : (e.message || 'حصل خطأ')); }
}
async function pkAdd() {
  try {
    const o = await api('/api/passkey/register/options', 'POST', {}), pk = o.publicKey; pk.challenge = pkU(pk.challenge); pk.user.id = pkU(pk.user.id); pk.excludeCredentials = (pk.excludeCredentials || []).map(x => ({ ...x, id: pkU(x.id) }));
    const c = await navigator.credentials.create({ publicKey: pk });
    await api('/api/passkey/register/verify', 'POST', { cid: o.cid, name: ($('#pkn') || {}).value || '', credential: { id: c.id, response: { clientDataJSON: pkB(c.response.clientDataJSON), attestationObject: pkB(c.response.attestationObject) } } });
    flash = msg('اتفعّلت البصمة ✓', 'ok'); go(view);
  } catch (e) { const m = $('#pkm'); if (m) m.innerHTML = msg(e && e.name === 'NotAllowedError' ? 'اتلغت العملية' : (e.message || 'حصل خطأ')); }
}
async function pkEnroll() {
  const m = $('#m'), en = $('#enw');
  try {
    const tk = window.pkTicket || '';
    if (!tk) throw new Error('سجّل دخولك بكلمة السر وكود التحقق الأول، وبعدها اضغط الزرار ده.');
    if (m) m.innerHTML = msg('بنجهّز الجهاز... اتبع رسالة البصمة من المتصفح', 'ok');
    const o = await api('/api/passkey/register/options', 'POST', { ticket: tk });
    const pk = o.publicKey; pk.challenge = pkU(pk.challenge); pk.user.id = pkU(pk.user.id); pk.excludeCredentials = (pk.excludeCredentials || []).map(x => ({ ...x, id: pkU(x.id) }));
    const c = await navigator.credentials.create({ publicKey: pk });
    const devName = isIOS() ? 'آيفون' : /android/i.test(navigator.userAgent) ? 'أندرويد' : 'كمبيوتر';
    const r = await api('/api/passkey/register/verify', 'POST', { ticket: tk, cid: o.cid, name: devName, credential: { id: c.id, response: { clientDataJSON: pkB(c.response.clientDataJSON), attestationObject: pkB(c.response.attestationObject) } } });
    window.pkTicket = ''; if (en) en.style.display = 'none';
    await afterLogin(r.user);
  } catch (e) {
    const txt = e && e.name === 'NotAllowedError' ? 'اتلغت عملية البصمة. جرّب تاني واضغط «سماح» لما المتصفح يسأل.' : (e.message || 'حصل خطأ');
    if (m) m.innerHTML = msg(txt);
  }
}
async function pkDel(id) { if (!confirm('تحذف البصمة دي؟')) return; try { await api('/api/passkey/delete', 'POST', { id }); go(view); } catch (e) { const m = $('#pkm'); if (m) m.innerHTML = msg(e.message); } }
async function pkPanel() {
  if (!me || !(await pkAvail())) return; const app = $('#app'); if (!app || !['orders', 'admin'].includes(view)) return;
  let r; try { r = await api('/api/passkeys'); } catch { return; }
  const d = document.createElement('div'); d.className = 'panel'; d.id = 'pkpanel';
  d.innerHTML = `<h2>الدخول بالبصمة</h2><div id="pkm"></div><p class="small">${me.role === 'admin' ? 'كل جهاز بيسجّل بصمته لوحده، وتقدر تسجّل لحد ١٠ أجهزة (موبايلك، موبايل أخوك، الكمبيوتر). عشان تضيف جهاز جديد: افتح المتجر على الجهاز ده، اضغط «دخول»، اكتب يوزر وباسورد الأدمن وكود التحقق، وبعدها اضغط «إضافة بصمة على الجهاز ده». أول ما فيه بصمة متسجلة، دخول الأدمن بيبقى بالبصمة بس.' : 'فعّل البصمة / قفل الشاشة عشان تدخل بسرعة من غير باسورد وكود تحقق.'}</p><p class="small">الأجهزة المسجلة: <b>${r.keys.length}</b>${r.keys.length >= 10 ? ' (وصلت للحد الأقصى، امسح جهاز مش مستخدم)' : ''}</p>` +
    r.keys.map(k => `<div class="pkr"><div><b>${esc(k.name)}</b><div class="sm">${new Date(k.createdAt).toLocaleDateString('ar-EG')}</div></div><button class="rm" onclick="pkDel('${esc(k.id)}')">حذف</button></div>`).join('') +
    `<label>اسم الجهاز</label><input id="pkn" maxlength="40" placeholder="مثلاً: موبايلي"><div class="row"><button class="btn" onclick="pkAdd()">🔐 تفعيل البصمة على الجهاز ده</button></div>`;
  app.appendChild(d);
}
async function auth(v) {
  try { const r = await api('/api/' + v, 'POST', { username: $('#u').value, password: $('#p').value, phone: v === 'register' ? $('#ph').value : undefined, country: v === 'register' ? $('#cn').value : undefined, captcha: $('#cp').value, captchaToken: window.capTok }); try { if (v === 'login') { const rm = $('#rm'); if (rm && rm.checked) localStorage.setItem('ru', $('#u').value.trim()); else localStorage.removeItem('ru'); } } catch {} await afterLogin(r.user); }
  catch (e) { $('#m').innerHTML = msg(e.message); const w = $('#capw'); if (e.capReq && w) w.style.display = ''; const en = $('#enw'); if (e.pkOnly && en) { window.pkTicket = e.pkTicket || ''; en.style.display = ''; } if (v === 'register' || (w && w.style.display !== 'none')) loadCap(); }
}
function forgotView(f) {
  $('#app').innerHTML = `<div class="panel narrow"><div class="ai">${ic('lock', 30)}</div><h2>نسيت الباسورد؟</h2><p class="small" style="margin-top:-8px">اكتب اسم المستخدم ورقم الموبايل اللي سجلت بيه، وهنبعتلك باسورد مؤقت على الواتساب.</p>${f}<div id="m"></div>
  <label>اسم المستخدم</label><input id="u" autocapitalize="none"><label>رقم الموبايل</label><input id="ph" inputmode="tel" placeholder="01xxxxxxxxx" onkeydown="if(event.key==='Enter')forgot()"><label>كود التحقق (عشان نتأكد إنك مش روبوت)</label><div class="cap" id="cap"></div><input id="cp" onkeydown="if(event.key==='Enter')forgot()" autocomplete="off" autocapitalize="characters" maxlength="8" placeholder="اكتب الحروف اللي في الصورة" dir="ltr" style="text-align:center;letter-spacing:3px">
  <button class="btn wide" onclick="forgot()">إرسال الطلب</button><div class="alt"><a onclick="go('login')">رجوع لتسجيل الدخول</a></div></div>`;
  loadCap();
}
async function forgot() {
  try { await api('/api/forgot', 'POST', { username: $('#u').value, phone: $('#ph').value, captcha: $('#cp').value, captchaToken: window.capTok });
    $('#m').innerHTML = msg('لو البيانات مظبوطة، طلبك وصل للإدارة وهيتواصلوا معاك على رقم الموبايل بباسورد مؤقت خلال وقت قصير.', 'ok'); loadCap(); } catch (e) { $('#m').innerHTML = msg(e.message); loadCap(); }
}
async function chPw() {
  try { await api('/api/password', 'POST', { oldPassword: $('#op').value, newPassword: $('#np').value }); $('#op').value = $('#np').value = ''; $('#pm').innerHTML = msg('اتغير الباسورد ✓', 'ok'); } catch (e) { $('#pm').innerHTML = msg(e.message); }
}
async function delUser(id, name) { if (!confirm('متأكد إنك عايز تحذف العميل ' + name + '؟ (طلباته القديمة هتفضل)')) return; try { await api('/api/users/' + id, 'DELETE'); flash = msg('اتحذف العميل ✓', 'ok'); } catch (e) { flash = msg(e.message); } go('admin'); }
async function resetUser(id, name, phone) {
  if (!confirm('تعمل باسورد مؤقت جديد للعميل ' + name + '؟')) return;
  try { const r = await api('/api/users/' + id + '/reset', 'POST'); const t = r.tempPassword, ph = phone ? '2' + phone : '';
    const txt = encodeURIComponent('أهلاً ' + name + '، الباسورد المؤقت بتاعك للمتجر: ' + t + ' . ادخل بيه وغيّره من صفحة طلباتي.');
    $('#rs' + id).innerHTML = `<div class="msg ok">الباسورد المؤقت: <b dir="ltr">${t}</b>${ph ? ` <a href="https://wa.me/${ph}?text=${txt}" target="_blank" rel="noopener" style="font-weight:800">ابعته واتساب</a>` : ''}</div>`; } catch (e) { alert(e.message); }
}
async function logout() { await api('/api/logout', 'POST'); me = null; go('shop'); }
const stc = s => ({ 'جديد': '', 'تم الشحن': 's2', 'تم التسليم': 's3', 'ملغي': 's4' }[s] || '');
async function ordersView(f) {
  if (!me) return go('login');
  const { orders } = await api('/api/orders');
  $('#app').innerHTML = f + `<div class="panel"><h2>${me.role === 'admin' ? 'كل الطلبات' : 'طلباتي'}</h2>` + (orders.length ? orders.map(o => `<div class="ord"><div class="h"><b>طلب #${o.id}</b><span class="st ${stc(o.status)}">${esc(o.status)}</span></div>
  <div class="small">${esc(o.username)} • ${new Date(o.date).toLocaleString('ar-EG')}</div>
  <div style="margin:6px 0">${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}</div><div><b>${money(o.total)} ${o.sym || 'ج.م'}</b>${o.shipping ? ` <span class="small">(شحن ${money(o.shipping)})</span>` : ''} <span class="small">• ${esc(o.address)} • ${esc(o.phone)}</span></div></div>`).join('') : `<div class="empty"><div class="e">${ic('box', 56)}</div>مفيش طلبات لحد دلوقتي.</div>`) + `</div><div class="panel narrow" style="margin-top:16px"><h2>تغيير الباسورد</h2><div id="pm"></div><label>الباسورد الحالي</label><input id="op" type="password" autocomplete="current-password"><label>الباسورد الجديد</label><input id="np" type="password" autocomplete="new-password"><button class="btn wide" onclick="chPw()">حفظ الباسورد الجديد</button></div>`;
}
let editing = null, catSel = '';
async function adminView(f, tab) {
  if (!me || me.role !== 'admin') return go('login');
  const { orders } = await api('/api/orders'); const { users } = await api('/api/users'); const e = editing || {}; catSel = editing ? (editing.cat || '') : '';
  const revText = Object.entries(orders.filter(o => o.status !== 'ملغي').reduce((m, o) => { const k = o.sym || 'ج.م'; m[k] = (m[k] || 0) + Number(o.total); return m; }, {})).map(([k, v]) => money(v) + ' ' + k).join(' + ') || '0';
  const rev = orders.filter(o => o.status !== 'ملغي').reduce((s, o) => s + Number(o.total), 0);
  $('#app').innerHTML = f + `<h2 style="margin:6px 0 14px;font-weight:800">لوحة التحكم</h2><div class="stats"><div class="stat"><span>المنتجات</span><b>${products.length}</b></div><div class="stat"><span>الطلبات</span><b>${orders.length}</b></div>
  <div class="stat"><span>طلبات جديدة</span><b>${orders.filter(o => o.status === 'جديد').length}</b></div><div class="stat"><span>إجمالي المبيعات</span><b>${revText}</b></div><div class="stat"><span>العملاء</span><b>${users.length}</b></div></div>
  <div class="adm"><div class="panel"><h2>${editing ? 'تعديل منتج' : 'إضافة منتج'}</h2><div id="m"></div>
  <label>الاسم</label><input id="n" value="${esc(e.name)}"><p class="small">اختار الدول اللي هتبيع فيها المنتج واكتب السعر بعملة كل دولة. المنتج مش هيظهر في أي دولة مش متعلّم عليها.</p>${['EG', 'SA', 'AE', 'IQ', 'OM'].map(c => { const v = c === 'EG' ? e.price : (e.prices || {})[c], on = v != null && v !== ''; return `<div class="cnr" style="margin:8px 0"><label style="display:flex;gap:8px;align-items:center;margin:0"><input type="checkbox" id="on_${c}" ${on ? 'checked' : ''} onchange="$('#${c === 'EG' ? 'pr' : 'pr_' + c}').style.display=this.checked?'':'none'" style="width:auto"> ${CNT[c].ar} (${CNT[c].sym})</label><input id="${c === 'EG' ? 'pr' : 'pr_' + c}" type="number" min="0" step="0.01" placeholder="السعر بـ${CNT[c].sym}" value="${on ? v : ''}" style="${on ? '' : 'display:none'}"></div>`; }).join('')}
  <label>القسم</label><button type="button" class="catfield${catSel ? ' has' : ''}" id="cgbtn" onclick="openCat()"><span>${catSel ? esc(catPath(catSel)) : 'اختار القسم من القائمة'}</span></button><input type="hidden" id="cg" value="${esc(catSel)}"><p class="small">اختار القسم عشان المنتج يظهر تحت القسم الصح في المتجر.</p><label>الكمية المتاحة</label><input id="st" type="number" min="0" value="${e.stock ?? ''}"><label>الوصف</label><textarea id="d" rows="3">${esc(e.description)}</textarea>
  <label>صورة المنتج (اختياري - ارفع صورة أو حط رابط)</label><input id="img" value="${esc(e.image && !e.image.startsWith('data:') && !e.image.startsWith('/img/') ? e.image : '')}" placeholder="https://..."><input type="file" id="file" accept="image/*">
  <div class="row"><button class="btn" onclick="saveProd()">${editing ? 'حفظ التعديل' : '＋ إضافة المنتج'}</button>${editing ? '<button class="btn gray" onclick="editing=null;go(\'admin\')">إلغاء</button>' : ''}</div></div>
  <div><div class="panel"><h2>شرائح العروض (السلايدر أعلى الصفحة الرئيسية)</h2><div id="om"></div>
  <label class="chk"><input type="checkbox" id="on" ${offer && offer.on ? 'checked' : ''}> ظاهر في الصفحة الرئيسية</label>
  <label>عنوان صغير فوق كل عرض (اختياري، مثلاً: عرض)</label><input id="ot" value="${esc(offer && offer.title)}"><label>نص العروض (كل سطر عرض = شريحة منفصلة في السلايدر)</label><textarea id="ox" rows="4">${esc(offer && offer.text)}</textarea>
  
  <button class="btn" onclick="saveOffer()">حفظ العرض</button></div>
  <div class="panel"><h2>المنتجات (${products.length})</h2>${products.map(p => `<div class="pr"><div class="im" style="${imgStyle(p)}">${imgIn(p)}</div><div><b>${esc(p.name)}</b><div class="sm">${p.cat ? esc(catPath(p.cat)) + ' • ' : ''}${['EG', ...Object.keys(p.prices || {})].filter(c => c !== 'EG' || p.price != null).map(c => CNT[c].ar).join('، ')} • الكمية ${p.stock}</div></div>
  <div class="row"><button class="btn gray" onclick="editProd(${p.id})">تعديل</button><button class="btn red" onclick="delProd(${p.id})">حذف</button></div></div>`).join('') || '<div class="empty">لسه مفيش منتجات.</div>'}</div>
  <div class="panel"><h2>العملاء المسجلين (${users.length})</h2>${users.map(x => `<div class="pr" style="grid-template-columns:1fr auto"><div><b>${esc(x.username)}</b>${x.resetAt ? ' <span class="st s2">طلب نسيان باسورد</span>' : ''}<div class="sm" dir="ltr" style="text-align:right">${esc(x.phone) || 'بدون رقم'} • ${x.createdAt ? new Date(x.createdAt).toLocaleDateString('en-GB') : '-'}</div><div id="rs${x.id}"></div></div>
  <div class="row"><button class="btn red" onclick="delUser(${x.id},'${esc(x.username)}')">حذف</button><button class="btn gray" onclick="resetUser(${x.id},'${esc(x.username)}','${esc(x.phone)}')">باسورد مؤقت</button></div></div>`).join('') || '<div class="empty">لسه مفيش عملاء.</div>'}</div>
  <div class="panel"><h2>الطلبات (${orders.length})</h2>${orders.map(o => `<div class="ord"><div class="h"><b>#${o.id} • ${esc(o.username)}</b><span class="st ${stc(o.status)}">${esc(o.status)}</span></div><div class="small">${money(o.total)} ج.م • ${esc(o.phone)} • ${esc(o.address)}</div><div>${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}</div>
  <select onchange="setStatus(${o.id},this.value)">${['جديد', 'تم الشحن', 'تم التسليم', 'ملغي'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select> <button class="btn red" id="do${o.id}" style="${o.status === 'ملغي' ? '' : 'display:none'}" onclick="delOrder(${o.id})">مسح الطلب</button></div>`).join('') || '<div class="empty">مفيش طلبات.</div>'}</div></div></div>`;
}
async function saveOffer() {
  try { const image = '';
    await api('/api/offer', 'PUT', { on: $('#on').checked, title: $('#ot').value, text: $('#ox').value, image }); flash = msg('اتحفظ العرض ✓', 'ok'); go('admin');
  } catch (e) { $('#om').innerHTML = msg(e.message); }
}
function editProd(id) { editing = products.find(p => p.id === id); go('admin'); scrollTo(0, 0); }
async function delProd(id) { if (!confirm('متأكد إنك عايز تحذف المنتج؟')) return; try { await api('/api/products/' + id, 'DELETE'); flash = msg('اتحذف ✓', 'ok'); } catch (e) { flash = msg(e.message); } go('admin'); }
async function setStatus(id, s) { try { await api(`/api/orders/${id}/status`, 'PUT', { status: s }); const b = $('#do' + id); if (b) b.style.display = s === 'ملغي' ? '' : 'none'; } catch (e) { alert(e.message); } }
function readFile(f) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .8)); }; im.onerror = () => no(new Error('صورة غير صالحة')); im.src = r.result; }; r.onerror = no; r.readAsDataURL(f); }); }
function openCat(top) {
  const old = document.getElementById('catsheet'); if (old) old.remove();
  const c = top ? CATS.find(x => x.id === top) : null;
  const body = c ? `<div class="csh"><button class="cback" onclick="openCat()">→ كل الأقسام</button><h4>${esc(c.name)}</h4><div class="clist"><button class="ci on" onclick="pickCat('${c.id}')"><span>كل ${esc(c.name)}</span><span class="cnt">القسم الرئيسي</span></button>${c.children.map(s => `<button class="ci" onclick="pickCat('${s.id}')"><span>${esc(s.name)}</span></button>`).join('')}</div></div>`
    : `<div class="csh"><h4>اختار القسم الرئيسي</h4><div class="clist">${CATS.map(x => `<button class="ci" onclick="openCat('${x.id}')"><span>${esc(x.name)}</span><span class="cnt">${x.children.length} فرعي</span></button>`).join('')}</div></div>`;
  const el = document.createElement('div'); el.id = 'catsheet';
  el.innerHTML = `<div class="mov" onclick="closeCat()"></div><div class="cpanel" role="dialog" aria-label="اختار القسم"><div class="ctop"><b>الأقسام</b><button class="mx" onclick="closeCat()" aria-label="إغلاق">✕</button></div>${body}</div>`;
  document.body.appendChild(el);
}
function closeCat() { const e = document.getElementById('catsheet'); if (e) e.remove(); }
function pickCat(id) { catSel = id; closeCat(); const b = document.getElementById('cgbtn'), h = document.getElementById('cg'); if (h) h.value = id; if (b) { b.innerHTML = `<span>${esc(catPath(id))}</span>`; b.classList.add('has'); } }
async function saveProd() {
  try {
    let image = $('#img').value.trim(); const file = $('#file').files[0];
    if (file) image = await readFile(file); else if (!image && editing && (editing.image.startsWith('data:') || editing.image.startsWith('/img/'))) image = editing.image;
    for (const c of ['EG', 'SA', 'AE', 'IQ', 'OM']) if ($('#on_' + c).checked && !(+$('#' + (c === 'EG' ? 'pr' : 'pr_' + c)).value > 0)) throw new Error('اكتب سعر المنتج في ' + CNT[c].ar);
    if (!$('#cg').value) throw new Error('اختار القسم من القائمة');
    const data = { name: $('#n').value, price: $('#on_EG').checked ? $('#pr').value : '', prices: Object.fromEntries(['SA', 'AE', 'IQ', 'OM'].map(c => [c, $('#on_' + c).checked ? ($('#pr_' + c).value || '') : ''])), stock: $('#st').value, description: $('#d').value, image, cat: $('#cg').value };
    if (editing) await api('/api/products/' + editing.id, 'PUT', data); else await api('/api/products', 'POST', data);
    flash = msg(editing ? 'اتعدل ✓' : 'اتضاف ✓', 'ok'); editing = null; go('admin');
  } catch (e) { $('#m').innerHTML = msg(e.message); }
}
(async () => { const m = api('/api/me').then(r => { me = r.user; try { if (me && me.country && !localStorage.getItem('country')) COUNTRY = me.country; } catch {} }).catch(() => {}); await Promise.all([m, loadData()]); go('shop'); })();
/* ===== Chat helper: rule-based auto replies + "talk to a person" on WhatsApp (no external services) ===== */
const CH = { faq: null, open: false, log: [], last: '', hist: [], ai: false };
const chL = (a, e) => LANG === 'en' ? e : a;
const chNorm = s => String(s || '').toLowerCase().replace(/[\u064B-\u065F\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\u0600-\u06FFa-z0-9 ]/g, ' ');
function chWa(q) { const wa = String((CH.wa || cfg.ownerWhatsapp) || '').replace(/\D/g, ''); const t = chL('أهلاً، عندي سؤال: ', 'Hi, I have a question: ') + (q || ''); return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(t.trim())}` : '#'; }
async function chLoad() { if (CH.faq) return; try { const r = await api('/api/chat'); CH.faq = r.faq; CH.wa = r.wa; CH.ai = !!r.ai; } catch { CH.faq = []; } }
function chMatch(q) {
  const n = chNorm(q), toks = n.split(/\s+/).filter(w => w.length > 1); let best = null, bs = 0;
  for (const f of CH.faq) { const ks = chNorm(f.k).split(/\s+/).filter(Boolean); let sc = 0; for (const w of toks) for (const k of ks) { if (w === k) sc += 2; else if (w.length > 2 && (k.startsWith(w) || w.startsWith(k)) && k.length > 2) sc += 1; } if (sc > bs) { bs = sc; best = f; } }
  return bs >= 2 ? best : null;
}
function chAdd(who, html) { CH.log.push({ who, html }); chPaint(); }
function chPaint() {
  const box = $('#chlog'); if (!box) return;
  box.innerHTML = CH.log.map(m => `<div class="cm ${m.who}">${m.html}</div>`).join('');
  box.scrollTop = box.scrollHeight;
}
async function chOrderStatus() {
  if (!me) { chAdd('bot', esc(chL('سجّل دخولك الأول عشان أقولك حالة طلباتك.', 'Please log in first so I can show your order status.')) + `<br><a class="cl" onclick="chClose();go('login')">${esc(chL('تسجيل الدخول', 'Log in'))}</a>`); return; }
  try {
    const { orders } = await api('/api/orders'); const mine = me.role === 'admin' ? [] : orders;
    if (!mine.length) return chAdd('bot', esc(chL('مفيش طلبات على حسابك لسه.', 'You have no orders yet.')));
    const o = mine[0]; const dt = o.createdAt ? new Date(o.createdAt).toLocaleDateString(LANG === 'en' ? 'en-GB' : 'ar-EG') : '';
    chAdd('bot', esc(chL(`آخر طلب ليك رقم #${o.id}${dt ? ' بتاريخ ' + dt : ''}: الحالة «${o.status}»، الإجمالي ${money(o.total)} ${o.sym || 'ج.م'}.`, `Your latest order #${o.id}${dt ? ' on ' + dt : ''}: status "${o.status}", total ${money(o.total)} ${o.currency || 'EGP'}.`)) + `<br><a class="cl" onclick="chClose();go('orders')">${esc(chL('كل طلباتي', 'All my orders'))}</a>`);
  } catch { chAdd('bot', esc(chL('معرفتش أجيب الطلبات دلوقتي، جرب تاني.', 'Could not load your orders, try again.'))); }
}
const chSens = t => /\d[\d\s\-.]{5,}\d|@|https?:\/\/|password|passwd|cvv|otp|باسورد|كلمة\s*(ال)?(سر|مرور)|(رقم|كود)\s*(الكارت|البطاقة|الفيزا|التحقق)|#\s?\d+|(order|طلب|اوردر|أوردر)\s*(id|no\.?|number|رقم|#)?\s*\d+/i.test(t);
async function chAsk(text, id) {
  text = String(text || '').trim(); if (!text) return; await chLoad();
  if (!id && chSens(text)) { CH.last = ''; chAdd('me', '•••'); return chAdd('bot', esc(chL('لحمايتك، متكتبش أرقام تليفون أو عناوين أو بيانات دفع أو أرقام طلبات أو كلمات سر هنا. اسأل سؤالك من غيرها، أو كلّم حد من الفريق على واتساب.', 'For your safety, please do not type phone numbers, addresses, payment details, order numbers or passwords here. Ask without them, or talk to our team on WhatsApp.')) + chHuman('', true)); }
  CH.last = text;
  chAdd('me', esc(text)); if (id === 'status' || /(حاله|حالة|فين).*(طلب|اوردر)|(طلبي|اوردري)|order status|my order|track/i.test(chNorm(text) + ' ' + text)) return chOrderStatus();
  if (!id && CH.ai) { CH.log.push({ who: 'bot', html: '<i>' + esc(chL('بكتب...', 'Typing...')) + '</i>' }); chPaint(); let ans = null; try { const r = await api('/api/chat/ask', 'POST', { q: text, h: CH.hist.slice(-4), c: COUNTRY }); ans = r.answer || null; } catch {} CH.log.pop();
    if (ans) { CH.hist.push({ r: 'user', t: text }, { r: 'assistant', t: ans }); return chAdd('bot', esc(ans).replace(/\n/g, '<br>') + `<div class="cn">${esc(chL('رد آلي، للتأكيد كلّم حد من الفريق.', 'Automated reply. Confirm with our team if needed.'))}</div>` + chHuman(text)); } }
  const f = id ? CH.faq.find(x => x.id === id) : chMatch(text);
  if (f) chAdd('bot', esc(chFaqText(f)).replace(/\n/g, '<br>') + chHuman(text));
  else chAdd('bot', esc(chL('مش متأكد إني فهمت سؤالك. اختار من الأسئلة السريعة تحت، أو كلّم حد من الفريق على واتساب وهيرد عليك.', 'I am not sure I understood. Pick a quick question below, or talk to our team on WhatsApp.')) + chHuman(text, true));
}
const chFaqText = f => { if (f.id === 'delivery' && COUNTRY !== 'EG') { const rl = regList(); return rl.length ? chL('الشحن لـ' + CNT[COUNTRY].ar + ' حسب المنطقة:\n' + rl.map(r => r.n + ': ' + cm(r.fee)).join('\n') + '\nمدة التوصيل بتتأكد على واتساب.', 'Shipping to ' + CNT[COUNTRY].en + ' by region:\n' + rl.map(r => r.n + ': ' + cm(r.fee)).join('\n') + '\nDelivery time is confirmed on WhatsApp.') : chL('الطلب لـ' + CNT[COUNTRY].ar + ' لسه مش متاح، مناطق الشحن هتتحدد قريب. كلّم حد على واتساب.', 'Orders to ' + CNT[COUNTRY].en + ' are not open yet. Talk to our team on WhatsApp.'); } return chL(f.a, f.ae); };
const chHuman = (q, big) => `<br><a class="cl wa${big ? ' big' : ''}" href="${chWa(q)}" target="_blank" rel="noopener">${esc(chL('كلّم حد على واتساب', 'Talk to a person on WhatsApp'))}</a>`;
function chSend() { const i = $('#chin'); if (!i) return; const v = i.value; i.value = ''; chAsk(v); }
function chChips() { return (CH.faq || []).map(f => `<button class="chip2" onclick="chAsk('${esc(chL(f.q, f.qe)).replace(/'/g, '&#39;')}','${f.id}')">${esc(chL(f.q, f.qe))}</button>`).join('') + `<button class="chip2" onclick="chAsk('${chL('حالة طلبي', 'My order status')}','status')">${chL('حالة طلبي', 'My order status')}</button>`; }
async function chOpen() {
  await chLoad(); CH.open = true; let p = $('#chpanel'); if (p) p.remove();
  if (!CH.log.length) CH.log.push({ who: 'bot', html: esc(chL('أهلاً بيك في تِكمو 👋 اسألني عن الطلب أو الدفع أو التوصيل، أو اختار من الأسئلة السريعة.', 'Welcome to Tekmoo 👋 Ask about ordering, payment or delivery, or pick a quick question.')) });
  p = document.createElement('div'); p.id = 'chpanel'; p.setAttribute('role', 'dialog'); p.setAttribute('dir', LANG === 'en' ? 'ltr' : 'rtl');
  p.innerHTML = `<div class="chh"><b>${esc(chL('مساعد تِكمو', 'Tekmoo assistant'))}</b><button onclick="chClose()" aria-label="close">✕</button></div><div id="chlog"></div><div class="chq">${chChips()}</div>
  ${CH.ai ? `<div class="chw">${esc(chL('ردود آلية بالذكاء الاصطناعي. متكتبش كلمات سر أو أرقام تليفون أو بيانات دفع أو أرقام طلبات.', 'AI-generated replies. Do not enter passwords, phone numbers, payment details or order numbers.'))}</div>` : ''}
  <div class="chf"><input id="chin" maxlength="200" autocomplete="off" placeholder="${esc(chL('اكتب سؤالك...', 'Type your question...'))}" onkeydown="if(event.key==='Enter')chSend()"><button class="chs" onclick="chSend()" aria-label="send">➤</button></div>
  <a class="chp" href="${chWa(CH.last)}" target="_blank" rel="noopener" onclick="this.href=chWa(CH.last)">${esc(chL('كلّم حد على واتساب', 'Talk to a person on WhatsApp'))}</a>`;
  document.body.appendChild(p); chPaint(); const b = $('#chbtn'); if (b) b.classList.add('on');
}
function chClose() { CH.open = false; const p = $('#chpanel'); if (p) p.remove(); const b = $('#chbtn'); if (b) b.classList.remove('on'); }
function chToggle() { CH.open ? chClose() : chOpen(); }
(function chInit() { const b = document.createElement('button'); b.id = 'chbtn'; b.setAttribute('aria-label', chL('مساعدة', 'Help')); b.onclick = chToggle; b.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14h4.5"/></svg>'; document.body.appendChild(b); })();
async function chAdminPanel() {
  const app = $('#app'); if (!app || view !== 'admin') return; await chLoad(); const r = await api('/api/chat'); CH.faq = r.faq;
  const d = document.createElement('div'); d.className = 'panel'; d.innerHTML = `<h2>ردود الشات التلقائي</h2><div id="chm"></div><p class="small">عدّل الإجابات اللي العميل بيشوفها في الشات. لو فضيت خانة بيرجع الرد الافتراضي.</p>` +
    CH.faq.map(f => `<label>${esc(f.q)}</label><textarea id="cha_${f.id}" rows="3">${esc(f.a)}</textarea>`).join('') + `<div class="row"><button class="btn" onclick="chSave()">حفظ الردود</button></div>`; app.appendChild(d);
  try { const sr = await api('/api/shipping'); const e = document.createElement('div'); e.className = 'panel'; e.innerHTML = `<h2>مصاريف الشحن حسب المحافظة</h2><div id="shm"></div>` + sr.tiers.map(t => `<label>${esc(t.areas.join('، '))}</label><input id="shf_${t.id}" inputmode="numeric" value="${t.fee}">`).join('') + ['SA', 'AE', 'IQ', 'OM'].map(c => `<h3 style="margin:16px 0 4px">مناطق الشحن - ${CNT[c].ar} (${CNT[c].sym})</h3><p class="small">أضف المناطق وسعر الشحن لكل منطقة. لو مفيش مناطق الطلب لـ${CNT[c].ar} مش هيتم.</p><div id="rg_${c}">${((sr.countries[c] || {}).regions || []).map(r => rgRow(r.n, r.fee)).join('')}</div><button type="button" class="btn ghost" onclick="rgAdd('${c}')">+ إضافة منطقة</button>`).join('') + `<div class="row"><button class="btn" onclick="shSave()">حفظ الشحن</button></div>`; app.appendChild(e); } catch {}
}
async function chSave() { try { const a = {}; CH.faq.forEach(f => { a[f.id] = ($('#cha_' + f.id) || {}).value || ''; }); const r = await api('/api/chat', 'PUT', { answers: a }); CH.faq = r.faq; $('#chm').innerHTML = msg('اتحفظت الردود ✓', 'ok'); } catch (e) { $('#chm').innerHTML = msg(e.message); } }

const rgRow = (n = '', fee = '') => `<div class="rgr" style="display:flex;gap:6px;margin:6px 0"><input class="rgn" placeholder="اسم المنطقة" value="${esc(n)}" style="flex:2"><input class="rgf" inputmode="decimal" placeholder="سعر الشحن" value="${esc(fee)}" style="flex:1"><button type="button" class="rm" onclick="this.parentNode.remove()" aria-label="حذف">✕</button></div>`;
function rgAdd(c) { $('#rg_' + c).insertAdjacentHTML('beforeend', rgRow()); }
async function shSave() { try { const f = {}; ['a', 'b', 'c'].forEach(k => { f[k] = $('#shf_' + k).value; }); const cs = {}; ['SA', 'AE', 'IQ', 'OM'].forEach(c => { cs[c] = [...document.querySelectorAll('#rg_' + c + ' .rgr')].map(r => ({ n: r.querySelector('.rgn').value, fee: r.querySelector('.rgf').value })); }); const r = await api('/api/shipping', 'PUT', { fees: f, regions: cs }); SHIP = r.tiers; SHIPC = r.countries; $('#shm').innerHTML = msg('اتحفظ الشحن ✓', 'ok'); } catch (e) { $('#shm').innerHTML = msg(e.message); } }

async function delOrder(id) { if (!confirm('متأكد إنك عايز تمسح الطلب #' + id + ' نهائي؟ مش هينفع ترجعه.')) return; try { await api('/api/orders/' + id, 'DELETE'); flash = msg('اتمسح الطلب ✓', 'ok'); go('admin'); } catch (e) { alert(e.message); } }

const PK = { truck: { i: 'truck', a: 'توصيل سريع', e: 'Fast delivery' }, cash: { i: 'cash', a: 'الدفع عند الاستلام', e: 'Cash on delivery' }, shield: { i: 'shield', a: 'جودة مضمونة', e: 'Quality' } };
async function perkBody(k) {
  if (k === 'cash') return chL('ادفع نقدًا للمندوب وقت ما تستلم طلبك. مفيش دفع أونلاين ومش محتاج كارت.', 'Pay in cash to the courier when you receive your order. No online payment and no card needed.');
  if (k === 'shield') return chL('بنختار منتجاتنا بعناية. لو عندك سؤال عن أي منتج، كلّمنا على واتساب من القائمة.', 'We pick our products with care. Have a question about a product? Message us on WhatsApp from the menu.');
  try { if (!SHIPC) { const r = await api('/api/shipping'); SHIP = r.tiers; SHIPC = r.countries; } } catch { return chL('مصاريف الشحن بتظهر في السلة حسب منطقتك.', 'Shipping fees are shown in your cart based on your area.'); }
  const fees = (COUNTRY === 'EG' ? (SHIP || []).map(t => +t.fee) : ((SHIPC[COUNTRY] || {}).regions || []).map(r => +r.fee)).filter(n => n >= 0 && isFinite(n)), s = sym(), c = cnm(COUNTRY);
  if (!fees.length) return chL(`الشحن إلى ${c}: المصاريف بتظهر في السلة حسب منطقتك.`, `Shipping to ${c}: the fee is shown in your cart based on your area.`);
  const lo = Math.min(...fees), hi = Math.max(...fees), r = lo === hi ? `${money(lo)} ${s}` : chL(`${money(lo)} لـ ${money(hi)} ${s}`, `${money(lo)} to ${money(hi)} ${s}`);
  return chL(`الشحن إلى ${c}: مصاريف الشحن حسب ${COUNTRY === 'EG' ? 'المحافظة' : 'المنطقة'}، من ${r}. بتختار منطقتك في السلة وبتشوف المصاريف بالظبط قبل ما تأكد الطلب.`, `Shipping to ${c}: the fee depends on your ${COUNTRY === 'EG' ? 'governorate' : 'region'}, ${r}. Pick your area in the cart and you see the exact fee before you confirm.`);
}
async function perkOpen(k, el) {
  const ic0 = el && el.querySelector('i'); if (ic0) { ic0.classList.remove('pop'); void ic0.offsetWidth; ic0.classList.add('pop'); }
  perkClose(); const o = document.createElement('div'); o.id = 'pksh'; o.className = 'pksh'; o.setAttribute('dir', LANG === 'en' ? 'ltr' : 'rtl');
  o.innerHTML = `<div class="pkbg" onclick="perkClose()"></div><div class="pkc" role="dialog" aria-modal="true" aria-label="${chL(PK[k].a, PK[k].e)}"><span class="pkg"></span><div class="pkh"><i>${ic(PK[k].i, 28)}</i><h3>${chL(PK[k].a, PK[k].e)}</h3></div><p id="pkt" class="pkp">…</p><button class="btn wide" onclick="perkClose()">${chL('تمام', 'Got it')}</button></div>`;
  document.body.appendChild(o); document.addEventListener('keydown', perkEsc);
  const t = await perkBody(k); const p = $('#pkt'); if (p) p.textContent = t;
}
function perkEsc(e) { if (e.key === 'Escape') perkClose(); }
function perkClose() { const o = $('#pksh'); if (o) o.remove(); document.removeEventListener('keydown', perkEsc); }

let cardBusy = false;
function cardTap(e, el, id) {
  if (cardBusy) return; cardBusy = true;
  const r = el.getBoundingClientRect(), x = (e.clientX || r.left + r.width / 2) - r.left, y = (e.clientY || r.top + r.height / 2) - r.top, d = Math.max(r.width, r.height) * 1.6;
  const s = document.createElement('span'); s.className = 'rip'; s.style.cssText = `width:${d}px;height:${d}px;left:${x - d / 2}px;top:${y - d / 2}px`;
  el.classList.add('tap'); el.appendChild(s);
  setTimeout(() => { cardBusy = false; el.classList.remove('tap'); s.remove(); openProd(id); }, matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 260);
}
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
