const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let me = null, offer = null, cat = '', products = [], cart = JSON.parse(localStorage.getItem('cart') || '[]'), flash = '';
async function api(url, method = 'GET', data) {
  const r = await fetch(url, { method, headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'حصل خطأ'); return j;
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
function nav() {
  const b = (v, ic, t, x = '') => `<button class="${view === v ? 'on' : ''}" onclick="go('${v}')"><span class="ic">${ic}</span>${t}${x}</button>`;
  $('#nav').innerHTML = b('shop', ic('home'), 'الرئيسية') + b('cart', ic('cart'), 'السلة', cartCount() ? `<span class="badge">${cartCount()}</span>` : '') +
    (me ? `${me.role === 'admin' ? b('admin', ic('gear'), 'لوحة التحكم') : ''}${b('orders', ic('box'), 'طلباتي')}<span class="usr">${esc(me.username)}</span><button onclick="logout()"><span class="ic">${ic('out')}</span>خروج</button>`
        : b('login', ic('user'), 'دخول') + b('register', ic('plus'), 'حساب جديد'));
}
async function go(v, arg) {
  try { products = (await api('/api/products')).products; } catch {}
  try { offer = (await api('/api/offer')).offer; } catch {}
  const ch = v !== view; view = v; nav(); const f = flash; flash = '';
  if (v === 'shop') return shop(f);
  if (v === 'prod') return prodView(f, arg);
  if (v === 'cart') return cartView(f);
  if (v === 'login' || v === 'register') return authView(v, f);
  if (v === 'forgot') return forgotView(f);
  if (v === 'orders') return ordersView(f);
  if (v === 'admin') return adminView(f, arg);
}
function filt() { const q = ($('#q') ? $('#q').value : '').trim().toLowerCase(); document.querySelectorAll('.card').forEach(c => c.style.display = c.dataset.s.includes(q) && (!cat || c.dataset.c === cat) ? '' : 'none'); }
function setCat(c) { cat = c; document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.dataset.c === c)); filt(); }
const cats = () => [...new Set(products.map(p => p.category).filter(Boolean))];
const catList = () => [...new Set(['إلكترونيات', 'ملابس', 'أدوات منزلية', 'إكسسوارات', ...products.map(p => p.category).filter(Boolean)])];
function offerCard() {
  if (!offer || !offer.on || !(offer.title || offer.text)) return '';
  return `<section class="offer"${offer.image ? ` style="background-image:linear-gradient(90deg,rgba(15,23,42,.88),rgba(15,23,42,.45)),url('${esc(offer.image)}')"` : ''}><span class="pill">${ic('spark', 14)} عرض</span><h3>${esc(offer.title)}</h3><p>${esc(offer.text)}</p><button class="cta" onclick="document.getElementById('prods').scrollIntoView({behavior:'smooth'})">تسوّق العرض ←</button></section>`;
}
function shop(f) {
  cat = ''; $('#app').innerHTML = f + offerCard() + `<section class="hero"><span class="pill">● تشكيلة جديدة وصلت</span><h2>تسوّق <em>أحلى المنتجات</em><br>بسعر وجودة تستاهلها</h2><p>اختار اللي يعجبك، اطلب في دقيقة، والدفع عند الاستلام لحد باب بيتك.</p>
  <button class="cta" onclick="document.getElementById('prods').scrollIntoView({behavior:'smooth'})">تصفّح المنتجات ←</button></section>
  <div class="perks"><div class="perk"><i>${ic('truck', 24)}</i><div><b>توصيل سريع</b><span>لحد باب البيت</span></div></div><div class="perk"><i>${ic('cash', 24)}</i><div><b>الدفع عند الاستلام</b><span>ادفع وانت بتستلم</span></div></div><div class="perk"><i>${ic('shield', 24)}</i><div><b>جودة مضمونة</b><span>منتجات مختارة بعناية</span></div></div></div>
  <div class="sh" id="prods"><h3>المنتجات<span>${products.length} منتج</span></h3><div class="search"><input id="q" placeholder="ابحث عن منتج..." oninput="filt()"></div></div>${cats().length > 0 ? `<div class="chips"><button class="chip on" data-c="" onclick="setCat('')">الكل</button>${cats().map(c => `<button class="chip" data-c="${esc(c)}" onclick="setCat(this.dataset.c)">${esc(c)}</button>`).join('')}</div>` : ''}` +
  (products.length ? `<div class="grid">${products.map(p => `<div class="card" onclick="openProd(${p.id})" data-c="${esc(p.category || '')}" data-s="${esc((p.name + ' ' + p.description).toLowerCase())}"><div class="img ${p.image ? '' : 'ph'}" style="${imgStyle(p)}">${imgIn(p)}${p.stock < 1 ? '<span class="tag out">نفذت الكمية</span>' : p.stock <= 3 ? `<span class="tag low">باقي ${p.stock} فقط</span>` : ''}</div>
  <div class="b"><div class="nm">${esc(p.name)}</div><div class="small">${esc(p.description)}</div><div class="price">${money(p.price)}<small>ج.م</small></div>
  <button class="btn" ${p.stock < 1 ? 'disabled' : ''} onclick="event.stopPropagation();addCart(${p.id})">${p.stock < 1 ? 'غير متاح' : ic('cart', 16) + ' أضف للسلة'}</button></div></div>`).join('')}</div>` : `<div class="panel empty"><div class="e">${ic('bag', 56)}</div>مفيش منتجات حاليًا، ارجع قريب.</div>`);
}
let after = null;
function needLogin(next, text) { after = next; flash = msg(text); go('login'); }
function openProd(id) { if (!me) return needLogin({ v: 'prod', a: id }, 'سجّل دخولك الأول عشان تشوف تفاصيل المنتج'); go('prod', id); }
function addCart(id, back) {
  if (!me) return needLogin({ v: 'prod', a: id }, 'لازم تسجّل دخول الأول عشان تطلب');
  const p = products.find(x => x.id === id), it = cart.find(x => x.id === id), q = (it ? it.qty : 0) + 1;
  if (!p || q > p.stock) { flash = msg('وصلت للحد الأقصى المتاح من المنتج ده'); return back ? go('prod', id) : go('shop'); }
  if (it) it.qty = q; else cart.push({ id, qty: 1 }); saveCart(); flash = msg('اتضاف للسلة ✓', 'ok'); back ? go('prod', id) : go('shop');
}
function prodView(f, id) {
  const p = products.find(x => x.id === id);
  if (!p) { flash = msg('المنتج مش موجود'); return go('shop'); }
  const lines = String(p.description || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const specs = lines.filter(l => /^[^:：]{1,30}[:：]\s*\S/.test(l)).map(l => l.split(/[:：]/)), desc = lines.filter(l => !/^[^:：]{1,30}[:：]\s*\S/.test(l));
  const st = p.stock < 1 ? '<span class="stk o">نفذت الكمية</span>' : p.stock <= 3 ? `<span class="stk l">باقي ${p.stock} فقط</span>` : '<span class="stk g">متوفر</span>';
  $('#app').innerHTML = f + `<a class="back" onclick="go('shop')">→ رجوع للمنتجات</a><div class="pd"><div class="pdi ${p.image ? '' : 'ph'}" style="${imgStyle(p)}">${imgIn(p)}</div>
  <div class="pdb">${p.category ? `<span class="catpill">${esc(p.category)}</span>` : ''}<h1>${esc(p.name)}</h1><div class="pdp">${money(p.price)}<small>ج.م</small></div>${st}
  ${desc.length ? `<h4>الوصف</h4><p class="pdd">${desc.map(esc).join('<br>')}</p>` : ''}
  ${specs.length ? `<h4>المواصفات</h4><table class="spec">${specs.map(r => `<tr><th>${esc(r[0].trim())}</th><td>${esc(r.slice(1).join(':').trim())}</td></tr>`).join('')}</table>` : ''}
  <div class="cod" style="margin:14px 0">${ic('cash', 18)} الدفع عند الاستلام</div>
  <button class="btn wide" ${p.stock < 1 ? 'disabled' : ''} onclick="addCart(${p.id}, true)">${p.stock < 1 ? 'غير متاح' : ic('cart', 16) + ' أضف للسلة'}</button>
  <button class="btn wide ghost" style="margin-top:8px" onclick="go('cart')">عرض السلة</button></div></div>`;
}
function cartView(f) {
  cart = cart.filter(i => products.some(p => p.id === i.id)); saveCart(); nav();
  if (!cart.length) return $('#app').innerHTML = f + `<div class="panel empty"><div class="e">${ic('cart', 56)}</div><h2>السلة فاضية</h2><button class="btn" onclick="go(\'shop\')">ابدأ التسوّق</button></div>`;
  const rows = cart.map(i => { const p = products.find(x => x.id === i.id); return `<div class="ci"><div class="im" style="${imgStyle(p)}">${imgIn(p)}</div>
  <div><b>${esc(p.name)}</b><div class="p">${money(p.price)} ج.م للقطعة</div><div class="stp" style="margin-top:6px"><button onclick="setQty(${i.id},${i.qty + 1})">+</button><span>${i.qty}</span><button onclick="setQty(${i.id},${i.qty - 1})">−</button></div></div>
  <div><div class="tot">${money(p.price * i.qty)} ج.م</div><button class="rm" onclick="setQty(${i.id},0)">${ic('trash', 14)} حذف</button></div></div>`; }).join('');
  const total = cart.reduce((s, i) => s + products.find(x => x.id === i.id).price * i.qty, 0);
  $('#app').innerHTML = f + `<h2 style="margin:6px 0 14px;font-weight:800">سلة المشتريات</h2><div class="cartwrap"><div class="panel">${rows}</div><div class="panel sum"><h2>ملخص الطلب</h2>
  <div class="ln"><span>عدد القطع</span><span>${cartCount()}</span></div><div class="ln"><span>التوصيل</span><span>يتحدد عند التأكيد</span></div><div class="ln big"><span>الإجمالي</span><span>${money(total)} ج.م</span></div>
  ${me ? `<div id="m"></div><label>العنوان</label><input id="addr" placeholder="المحافظة، المدينة، الشارع"><label>رقم التليفون</label><input id="ph" inputmode="tel" placeholder="01xxxxxxxxx"><div class="cod">${ic('cash', 18)} الدفع عند الاستلام</div><button class="btn wide" onclick="checkout()">تأكيد الطلب</button>`
       : '<p class="small">لازم تسجل دخول عشان تكمل الطلب.</p><button class="btn wide" onclick="go(\'login\')">دخول</button>'}</div></div>`;
}
function setQty(id, q) { q = parseInt(q, 10) || 0; const p = products.find(x => x.id === id);
  if (q > p.stock) { q = p.stock; flash = msg('الكمية المتاحة ' + p.stock + ' فقط'); }
  cart = q > 0 ? cart.map(i => i.id === id ? { ...i, qty: q } : i) : cart.filter(i => i.id !== id); saveCart(); go('cart'); }
async function checkout() {
  try { await api('/api/orders', 'POST', { items: cart, address: $('#addr').value, phone: $('#ph').value });
    cart = []; saveCart(); flash = msg('تم تسجيل طلبك بنجاح ✓ هنتواصل معاك قريب', 'ok'); go('orders'); } catch (e) { $('#m').innerHTML = msg(e.message); }
}
function authView(v, f) {
  const reg = v === 'register';
  $('#app').innerHTML = `<div class="panel narrow"><div class="ai">${ic(reg ? 'spark' : 'lock', 30)}</div><h2>${reg ? 'إنشاء حساب جديد' : 'أهلاً بيك تاني'}</h2><p class="small" style="margin-top:-8px">${reg ? 'سجّل في ثواني وابدأ اطلب' : 'سجّل دخولك عشان تكمل طلباتك'}</p>${f}<div id="m"></div><label>اسم المستخدم</label><input id="u" autocomplete="username" autocapitalize="none">
  ${reg ? '<label>رقم الموبايل</label><input id="ph" inputmode="tel" autocomplete="tel" placeholder="01xxxxxxxxx">' : ''}<label>الباسورد</label><input id="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" onkeydown="if(event.key==='Enter')auth('${v}')">
  <button class="btn wide" onclick="auth('${v}')">${reg ? 'إنشاء الحساب' : 'دخول'}</button>
  ${reg ? '' : '<div class="alt" style="margin-top:10px"><a onclick="go(\'forgot\')">نسيت الباسورد؟</a></div>'}
  <div class="alt">${reg ? 'عندك حساب؟ <a onclick="go(\'login\')">سجّل دخول</a>' : 'مش عندك حساب؟ <a onclick="go(\'register\')">أنشئ حساب</a>'}</div></div>`;
}
async function auth(v) {
  try { me = (await api('/api/' + v, 'POST', { username: $('#u').value, password: $('#p').value, phone: v === 'register' ? $('#ph').value : undefined })).user; flash = msg('أهلاً ' + me.username, 'ok'); const a = after; after = null; if (a && me.role !== 'admin') go(a.v, a.a); else go(me.role === 'admin' ? 'admin' : 'shop'); }
  catch (e) { $('#m').innerHTML = msg(e.message); }
}
function forgotView(f) {
  $('#app').innerHTML = `<div class="panel narrow"><div class="ai">${ic('lock', 30)}</div><h2>نسيت الباسورد؟</h2><p class="small" style="margin-top:-8px">اكتب اسم المستخدم ورقم الموبايل اللي سجلت بيه، وهنبعتلك باسورد مؤقت على الواتساب.</p>${f}<div id="m"></div>
  <label>اسم المستخدم</label><input id="u" autocapitalize="none"><label>رقم الموبايل</label><input id="ph" inputmode="tel" placeholder="01xxxxxxxxx" onkeydown="if(event.key==='Enter')forgot()">
  <button class="btn wide" onclick="forgot()">إرسال الطلب</button><div class="alt"><a onclick="go('login')">رجوع لتسجيل الدخول</a></div></div>`;
}
async function forgot() {
  try { await api('/api/forgot', 'POST', { username: $('#u').value, phone: $('#ph').value });
    $('#m').innerHTML = msg('لو البيانات مظبوطة، طلبك وصل للإدارة وهيتواصلوا معاك على رقم الموبايل بباسورد مؤقت خلال وقت قصير.', 'ok'); } catch (e) { $('#m').innerHTML = msg(e.message); }
}
async function chPw() {
  try { await api('/api/password', 'POST', { oldPassword: $('#op').value, newPassword: $('#np').value }); $('#op').value = $('#np').value = ''; $('#pm').innerHTML = msg('اتغير الباسورد ✓', 'ok'); } catch (e) { $('#pm').innerHTML = msg(e.message); }
}
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
  <div style="margin:6px 0">${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}</div><div><b>${money(o.total)} ج.م</b> <span class="small">• ${esc(o.address)} • ${esc(o.phone)}</span></div></div>`).join('') : `<div class="empty"><div class="e">${ic('box', 56)}</div>مفيش طلبات لحد دلوقتي.</div>`) + `</div><div class="panel narrow" style="margin-top:16px"><h2>تغيير الباسورد</h2><div id="pm"></div><label>الباسورد الحالي</label><input id="op" type="password" autocomplete="current-password"><label>الباسورد الجديد</label><input id="np" type="password" autocomplete="new-password"><button class="btn wide" onclick="chPw()">حفظ الباسورد الجديد</button></div>`;
}
let editing = null;
async function adminView(f, tab) {
  if (!me || me.role !== 'admin') return go('login');
  const { orders } = await api('/api/orders'); const { users } = await api('/api/users'); const e = editing || {};
  const rev = orders.filter(o => o.status !== 'ملغي').reduce((s, o) => s + Number(o.total), 0);
  $('#app').innerHTML = f + `<h2 style="margin:6px 0 14px;font-weight:800">لوحة التحكم</h2><div class="stats"><div class="stat"><span>المنتجات</span><b>${products.length}</b></div><div class="stat"><span>الطلبات</span><b>${orders.length}</b></div>
  <div class="stat"><span>طلبات جديدة</span><b>${orders.filter(o => o.status === 'جديد').length}</b></div><div class="stat"><span>إجمالي المبيعات</span><b>${money(rev)} ج.م</b></div><div class="stat"><span>العملاء</span><b>${users.length}</b></div></div>
  <div class="adm"><div class="panel"><h2>${editing ? 'تعديل منتج' : 'إضافة منتج'}</h2><div id="m"></div>
  <label>الاسم</label><input id="n" value="${esc(e.name)}"><label>السعر (ج.م)</label><input id="pr" type="number" min="0" step="0.01" value="${e.price ?? ''}">
  <label>القسم</label><input id="cg" list="cgl" value="${esc(e.category)}" placeholder="اختار قسم أو اكتب قسم جديد"><datalist id="cgl">${catList().map(c => `<option value="${esc(c)}">`).join('')}</datalist><label>الكمية المتاحة</label><input id="st" type="number" min="0" value="${e.stock ?? ''}"><label>الوصف</label><textarea id="d" rows="3">${esc(e.description)}</textarea>
  <label>صورة المنتج (اختياري - ارفع صورة أو حط رابط)</label><input id="img" value="${esc(e.image && !e.image.startsWith('data:') ? e.image : '')}" placeholder="https://..."><input type="file" id="file" accept="image/*">
  <div class="row"><button class="btn" onclick="saveProd()">${editing ? 'حفظ التعديل' : '＋ إضافة المنتج'}</button>${editing ? '<button class="btn gray" onclick="editing=null;go(\'admin\')">إلغاء</button>' : ''}</div></div>
  <div><div class="panel"><h2>كارت العروض (أعلى الصفحة الرئيسية)</h2><div id="om"></div>
  <label class="chk"><input type="checkbox" id="on" ${offer && offer.on ? 'checked' : ''}> ظاهر في الصفحة الرئيسية</label>
  <label>عنوان العرض</label><input id="ot" value="${esc(offer && offer.title)}"><label>نص العرض</label><textarea id="ox" rows="2">${esc(offer && offer.text)}</textarea>
  <label>صورة خلفية (اختياري - رابط أو ارفع صورة)</label><input id="oi" value="${esc(offer && offer.image && !offer.image.startsWith('data:') ? offer.image : '')}" placeholder="https://..."><input type="file" id="of" accept="image/*">
  <button class="btn" onclick="saveOffer()">حفظ العرض</button></div>
  <div class="panel"><h2>المنتجات (${products.length})</h2>${products.map(p => `<div class="pr"><div class="im" style="${imgStyle(p)}">${imgIn(p)}</div><div><b>${esc(p.name)}</b><div class="sm">${money(p.price)} ج.م • الكمية ${p.stock}</div></div>
  <div class="row"><button class="btn gray" onclick="editProd(${p.id})">تعديل</button><button class="btn red" onclick="delProd(${p.id})">حذف</button></div></div>`).join('') || '<div class="empty">لسه مفيش منتجات.</div>'}</div>
  <div class="panel"><h2>العملاء المسجلين (${users.length})</h2>${users.map(x => `<div class="pr" style="grid-template-columns:1fr auto"><div><b>${esc(x.username)}</b>${x.resetAt ? ' <span class="st s2">طلب نسيان باسورد</span>' : ''}<div class="sm" dir="ltr" style="text-align:right">${esc(x.phone) || 'بدون رقم'} • ${x.createdAt ? new Date(x.createdAt).toLocaleDateString('en-GB') : '-'}</div><div id="rs${x.id}"></div></div>
  <div class="row"><button class="btn red" onclick="delUser(${x.id},'${esc(x.username)}')">حذف</button><button class="btn gray" onclick="resetUser(${x.id},'${esc(x.username)}','${esc(x.phone)}')">باسورد مؤقت</button></div></div>`).join('') || '<div class="empty">لسه مفيش عملاء.</div>'}</div>
  <div class="panel"><h2>الطلبات (${orders.length})</h2>${orders.map(o => `<div class="ord"><div class="h"><b>#${o.id} • ${esc(o.username)}</b><span class="st ${stc(o.status)}">${esc(o.status)}</span></div><div class="small">${money(o.total)} ج.م • ${esc(o.phone)} • ${esc(o.address)}</div><div>${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}</div>
  <select onchange="setStatus(${o.id},this.value)">${['جديد', 'تم الشحن', 'تم التسليم', 'ملغي'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`).join('') || '<div class="empty">مفيش طلبات.</div>'}</div></div></div>`;
}
async function saveOffer() {
  try { let image = $('#oi').value.trim(); const file = $('#of').files[0];
    if (file) image = await readFile(file); else if (!image && offer && offer.image && offer.image.startsWith('data:')) image = offer.image;
    await api('/api/offer', 'PUT', { on: $('#on').checked, title: $('#ot').value, text: $('#ox').value, image }); flash = msg('اتحفظ العرض ✓', 'ok'); go('admin');
  } catch (e) { $('#om').innerHTML = msg(e.message); }
}
function editProd(id) { editing = products.find(p => p.id === id); go('admin'); scrollTo(0, 0); }
async function delProd(id) { if (!confirm('متأكد إنك عايز تحذف المنتج؟')) return; try { await api('/api/products/' + id, 'DELETE'); flash = msg('اتحذف ✓', 'ok'); } catch (e) { flash = msg(e.message); } go('admin'); }
async function setStatus(id, s) { try { await api(`/api/orders/${id}/status`, 'PUT', { status: s }); } catch (e) { alert(e.message); } }
function readFile(f) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .8)); }; im.onerror = () => no(new Error('صورة غير صالحة')); im.src = r.result; }; r.onerror = no; r.readAsDataURL(f); }); }
async function saveProd() {
  try {
    let image = $('#img').value.trim(); const file = $('#file').files[0];
    if (file) image = await readFile(file); else if (!image && editing && editing.image.startsWith('data:')) image = editing.image;
    const data = { name: $('#n').value, price: $('#pr').value, stock: $('#st').value, description: $('#d').value, image, category: $('#cg').value };
    if (editing) await api('/api/products/' + editing.id, 'PUT', data); else await api('/api/products', 'POST', data);
    flash = msg(editing ? 'اتعدل ✓' : 'اتضاف ✓', 'ok'); editing = null; go('admin');
  } catch (e) { $('#m').innerHTML = msg(e.message); }
}
(async () => { try { me = (await api('/api/me')).user; } catch {} go('shop'); })();
