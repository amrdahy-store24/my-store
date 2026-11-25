const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let me = null, products = [], cart = JSON.parse(localStorage.getItem('cart') || '[]'), flash = '';
async function api(url, method = 'GET', data) {
  const r = await fetch(url, { method, headers: data ? { 'Content-Type': 'application/json' } : {}, body: data ? JSON.stringify(data) : undefined });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'حصل خطأ'); return j;
}
const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
const msg = (t, c = 'err') => `<div class="msg ${c}">${esc(t)}</div>`;
function nav() {
  $('#nav').innerHTML = `<button onclick="go('shop')">المنتجات</button><button onclick="go('cart')">🛒 السلة (${cartCount()})</button>` +
    (me ? `${me.role === 'admin' ? '<button onclick="go(\'admin\')">لوحة التحكم</button>' : ''}<button onclick="go('orders')">طلباتي</button><span>👤 ${esc(me.username)}</span><button onclick="logout()">خروج</button>`
        : `<button onclick="go('login')">دخول</button><button onclick="go('register')">حساب جديد</button>`);
}
async function go(v, arg) {
  try { products = (await api('/api/products')).products; } catch {}
  nav(); const f = flash; flash = '';
  if (v === 'shop') return shop(f);
  if (v === 'cart') return cartView(f);
  if (v === 'login' || v === 'register') return authView(v, f);
  if (v === 'orders') return ordersView(f);
  if (v === 'admin') return adminView(f, arg);
}
function shop(f) {
  $('#app').innerHTML = f + (products.length ? `<div class="grid">${products.map(p => `<div class="card"><div class="img" style="${p.image ? `background-image:url('${esc(p.image)}')` : ''}">${p.image ? '' : '📦'}</div>
  <div class="b"><b>${esc(p.name)}</b><div class="small">${esc(p.description)}</div><div class="price">${p.price} ج.م</div>
  <div class="small">${p.stock > 0 ? 'متاح: ' + p.stock : 'نفذت الكمية'}</div>
  <button class="btn" ${p.stock < 1 ? 'disabled' : ''} onclick="addCart(${p.id})">أضف للسلة</button></div></div>`).join('')}</div>` : '<div class="panel">مفيش منتجات حاليًا.</div>');
}
function addCart(id) {
  const p = products.find(x => x.id === id), it = cart.find(x => x.id === id), q = (it ? it.qty : 0) + 1;
  if (!p || q > p.stock) { flash = msg('وصلت للحد الأقصى المتاح من المنتج ده'); return go('shop'); }
  if (it) it.qty = q; else cart.push({ id, qty: 1 }); saveCart(); flash = msg('اتضاف للسلة ✓', 'ok'); go('shop');
}
function cartView(f) {
  cart = cart.filter(i => products.some(p => p.id === i.id)); saveCart(); nav();
  if (!cart.length) return $('#app').innerHTML = f + '<div class="panel">السلة فاضية.</div>';
  const rows = cart.map(i => { const p = products.find(x => x.id === i.id); return `<tr><td>${esc(p.name)}</td><td>${p.price}</td>
  <td><input type="number" min="1" max="${p.stock}" value="${i.qty}" style="width:70px;margin:0" onchange="setQty(${i.id},this.value)"></td><td>${p.price * i.qty}</td>
  <td><button class="btn red" onclick="setQty(${i.id},0)">حذف</button></td></tr>`; }).join('');
  const total = cart.reduce((s, i) => s + products.find(x => x.id === i.id).price * i.qty, 0);
  $('#app').innerHTML = f + `<div class="panel"><table><tr><th>المنتج</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th><th></th></tr>${rows}</table><h3>الإجمالي: ${total} ج.م</h3>
  ${me ? `<div id="m"></div><label>العنوان</label><input id="addr"><label>رقم التليفون</label><input id="ph" inputmode="tel"><button class="btn" onclick="checkout()">تأكيد الطلب (الدفع عند الاستلام)</button>`
       : '<p>لازم تسجل دخول عشان تكمل الطلب.</p><button class="btn" onclick="go(\'login\')">دخول</button>'}</div>`;
}
function setQty(id, q) { q = parseInt(q, 10) || 0; const p = products.find(x => x.id === id);
  if (q > p.stock) { q = p.stock; flash = msg('الكمية المتاحة ' + p.stock + ' فقط'); }
  cart = q > 0 ? cart.map(i => i.id === id ? { ...i, qty: q } : i) : cart.filter(i => i.id !== id); saveCart(); go('cart'); }
async function checkout() {
  try { await api('/api/orders', 'POST', { items: cart, address: $('#addr').value, phone: $('#ph').value });
    cart = []; saveCart(); flash = msg('تم تسجيل طلبك بنجاح ✓', 'ok'); go('orders'); } catch (e) { $('#m').innerHTML = msg(e.message); }
}
function authView(v, f) {
  const reg = v === 'register';
  $('#app').innerHTML = `<div class="panel narrow"><h2>${reg ? 'حساب جديد' : 'تسجيل الدخول'}</h2>${f}<div id="m"></div><label>اسم المستخدم</label><input id="u" autocomplete="username">
  <label>الباسورد</label><input id="p" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" onkeydown="if(event.key==='Enter')auth('${v}')">
  <button class="btn" style="width:100%" onclick="auth('${v}')">${reg ? 'إنشاء الحساب' : 'دخول'}</button></div>`;
}
async function auth(v) {
  try { me = (await api('/api/' + v, 'POST', { username: $('#u').value, password: $('#p').value })).user; flash = msg('أهلاً ' + me.username, 'ok'); go(me.role === 'admin' ? 'admin' : 'shop'); }
  catch (e) { $('#m').innerHTML = msg(e.message); }
}
async function logout() { await api('/api/logout', 'POST'); me = null; go('shop'); }
async function ordersView(f) {
  if (!me) return go('login');
  const { orders } = await api('/api/orders');
  $('#app').innerHTML = f + `<div class="panel"><h2>${me.role === 'admin' ? 'كل الطلبات' : 'طلباتي'}</h2>` + (orders.length ? orders.map(o => `<div class="panel" style="background:#f8fafc"><b>طلب #${o.id}</b> - ${esc(o.username)} - ${new Date(o.date).toLocaleString('ar-EG')} - <b>${esc(o.status)}</b>
  <div>${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}</div><div>الإجمالي: ${o.total} ج.م | ${esc(o.address)} | ${esc(o.phone)}</div></div>`).join('') : 'مفيش طلبات.') + '</div>';
}
let editing = null;
async function adminView(f, tab) {
  if (!me || me.role !== 'admin') return go('login');
  const { orders } = await api('/api/orders'); const e = editing || {};
  $('#app').innerHTML = f + `<div class="panel"><h2>${editing ? 'تعديل منتج' : 'إضافة منتج'}</h2><div id="m"></div>
  <label>الاسم</label><input id="n" value="${esc(e.name)}"><label>السعر (ج.م)</label><input id="pr" type="number" min="0" step="0.01" value="${e.price ?? ''}">
  <label>الكمية المتاحة</label><input id="st" type="number" min="0" value="${e.stock ?? ''}"><label>الوصف</label><textarea id="d">${esc(e.description)}</textarea>
  <label>صورة المنتج (اختياري - ارفع صورة أو حط رابط)</label><input id="img" value="${esc(e.image && !e.image.startsWith('data:') ? e.image : '')}" placeholder="https://..."><input type="file" id="file" accept="image/*">
  <div class="row"><button class="btn" onclick="saveProd()">${editing ? 'حفظ التعديل' : 'إضافة'}</button>${editing ? '<button class="btn gray" onclick="editing=null;go(\'admin\')">إلغاء</button>' : ''}</div></div>
  <div class="panel"><h2>المنتجات (${products.length})</h2><table><tr><th>الاسم</th><th>السعر</th><th>الكمية</th><th></th></tr>${products.map(p => `<tr><td>${esc(p.name)}</td><td>${p.price}</td><td>${p.stock}</td>
  <td class="row"><button class="btn gray" onclick="editProd(${p.id})">تعديل</button><button class="btn red" onclick="delProd(${p.id})">حذف</button></td></tr>`).join('')}</table></div>
  <div class="panel"><h2>الطلبات (${orders.length})</h2>${orders.map(o => `<div class="panel" style="background:#f8fafc"><b>#${o.id}</b> ${esc(o.username)} - ${o.total} ج.م - ${esc(o.phone)} - ${esc(o.address)}<br>${o.items.map(i => esc(i.name) + ' × ' + i.qty).join('، ')}
  <select onchange="setStatus(${o.id},this.value)">${['جديد', 'تم الشحن', 'تم التسليم', 'ملغي'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></div>`).join('') || 'مفيش طلبات.'}</div>`;
}
function editProd(id) { editing = products.find(p => p.id === id); go('admin'); scrollTo(0, 0); }
async function delProd(id) { if (!confirm('متأكد إنك عايز تحذف المنتج؟')) return; try { await api('/api/products/' + id, 'DELETE'); flash = msg('اتحذف ✓', 'ok'); } catch (e) { flash = msg(e.message); } go('admin'); }
async function setStatus(id, s) { try { await api(`/api/orders/${id}/status`, 'PUT', { status: s }); } catch (e) { alert(e.message); } }
function readFile(f) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 600 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', .8)); }; im.onerror = () => no(new Error('صورة غير صالحة')); im.src = r.result; }; r.onerror = no; r.readAsDataURL(f); }); }
async function saveProd() {
  try {
    let image = $('#img').value.trim(); const file = $('#file').files[0];
    if (file) image = await readFile(file); else if (!image && editing && editing.image.startsWith('data:')) image = editing.image;
    const data = { name: $('#n').value, price: $('#pr').value, stock: $('#st').value, description: $('#d').value, image };
    if (editing) await api('/api/products/' + editing.id, 'PUT', data); else await api('/api/products', 'POST', data);
    flash = msg(editing ? 'اتعدل ✓' : 'اتضاف ✓', 'ok'); editing = null; go('admin');
  } catch (e) { $('#m').innerHTML = msg(e.message); }
}
(async () => { try { me = (await api('/api/me')).user; } catch {} go('shop'); })();
