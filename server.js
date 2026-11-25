// متجر إلكتروني - بدون أي مكتبات خارجية. شغّله: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
// رقم واتساب صاحب المتجر (بصيغة دولية بدون + ). غيّره من هنا أو من متغير OWNER_WHATSAPP في Render
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '201558221315';

function hash(pw, salt) { return crypto.scryptSync(pw, salt, 32).toString('hex'); }
function load(stored) {
  if (stored) return stored;
  if (!process.env.DATABASE_URL && fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const salt = crypto.randomBytes(16).toString('hex');
  const db = { nextId: 10, users: [{ id: 1, username: ADMIN_USER.toLowerCase(), salt, hash: hash(ADMIN_PASS, salt), role: 'admin' }],
    products: [
      { id: 2, name: 'سماعات بلوتوث', price: 450, stock: 20, description: 'سماعات لاسلكية بصوت نقي وبطارية تعمل 20 ساعة.', image: '' },
      { id: 3, name: 'ساعة ذكية', price: 900, stock: 10, description: 'ساعة ذكية بشاشة ملونة وتتبع للنشاط.', image: '' },
      { id: 4, name: 'حقيبة ظهر', price: 300, stock: 15, description: 'حقيبة متينة مقاومة للماء تناسب اللابتوب.', image: '' }],
    orders: [] };
  save(db); return db;
}
let pool = null, chain = Promise.resolve();
function save(db) {
  if (pool) { const j = JSON.stringify(db); chain = chain.then(() => pool.query("INSERT INTO store(id,data) VALUES(1,$1) ON CONFLICT(id) DO UPDATE SET data=$1", [j])).catch(e => console.error('DB save failed', e.message)); return; }
  fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 1)); fs.renameSync(DB_FILE + '.tmp', DB_FILE);
}
let db;
const sessions = { get: t => db.sessions[t], set: (t, id) => { db.sessions[t] = id; save(db); }, delete: t => { delete db.sessions[t]; save(db); } };

function send(res, code, obj, headers = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(obj));
}
function body(req) {
  return new Promise((ok, no) => {
    let s = ''; req.on('data', c => { s += c; if (s.length > 6e6) { no(new Error('كبير')); req.destroy(); } });
    req.on('end', () => { try { ok(s ? JSON.parse(s) : {}); } catch { no(new Error('بيانات غير صالحة')); } });
  });
}
function getUser(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]+)/.exec(req.headers.cookie || '');
  const id = m && sessions.get(m[1]);
  return id ? db.users.find(u => u.id === id) : null;
}
const pub = u => u && { id: u.id, username: u.username, role: u.role, status: u.status || 'active', phone: u.phone || '' };
function normPhone(v) { let x = String(v || '').replace(/[\s\-()]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); if (x.startsWith('+20')) x = '0' + x.slice(3); else if (x.startsWith('0020')) x = '0' + x.slice(4); return /^01[0125]\d{8}$/.test(x) ? x : ''; }
class Err extends Error { constructor(code, msg) { super(msg); this.code = code; } }
function need(u, role) { if (!u) throw new Err(401, 'سجّل دخولك الأول'); if (role && u.role !== role) throw new Err(403, 'غير مسموح'); }

function cleanProduct(b) {
  const name = String(b.name || '').trim(), price = Number(b.price), stock = parseInt(b.stock, 10);
  if (!name) throw new Err(400, 'اسم المنتج مطلوب');
  if (!(price >= 0) || !isFinite(price)) throw new Err(400, 'السعر غير صحيح');
  if (!(stock >= 0)) throw new Err(400, 'الكمية غير صحيحة');
  const image = String(b.image || '');
  if (image && !/^(https?:\/\/|data:image\/)/.test(image)) throw new Err(400, 'رابط الصورة غير صحيح');
  return { name: name.slice(0, 100), price: Math.round(price * 100) / 100, stock, description: String(b.description || '').slice(0, 1000), image };
}

async function api(req, res, url) {
  const u = getUser(req), m = req.method, p = url.pathname;
  let r;
  if (m === 'POST' && p === '/api/register') {
    const b = await body(req); const username = String(b.username || '').trim().toLowerCase(), pw = String(b.password || '');
    if (!/^[a-z0-9_.]{3,20}$/.test(username)) throw new Err(400, 'اليوزر 3-20 حرف إنجليزي أو أرقام أو _ .');
    if (pw.length < 6) throw new Err(400, 'الباسورد لازم 6 حروف على الأقل');
    if (db.users.some(x => x.username === username)) throw new Err(409, 'اليوزر ده مستخدم، اختار غيره');
    const phone = normPhone(b.phone); if (!phone) throw new Err(400, 'اكتب رقم موبايل مصري صحيح (مثال 01012345678)');
    if (db.users.some(x => x.phone === phone)) throw new Err(409, 'الرقم ده مسجل بحساب تاني');
    const salt = crypto.randomBytes(16).toString('hex');
    const nu = { id: db.nextId++, username, salt, hash: hash(pw, salt), role: 'customer', phone, status: 'pending', createdAt: new Date().toISOString() };
    db.users.push(nu); save(db);
    return login(res, nu);
  }
  if (m === 'POST' && p === '/api/login') {
    const b = await body(req); const username = String(b.username || '').trim().toLowerCase();
    const x = db.users.find(y => y.username === username);
    if (!x || !crypto.timingSafeEqual(Buffer.from(hash(String(b.password || ''), x.salt), 'hex'), Buffer.from(x.hash, 'hex')))
      throw new Err(401, 'اليوزر أو الباسورد غلط');
    return login(res, x);
  }
  if (m === 'POST' && p === '/api/forgot') {
    const b = await body(req); const x = db.users.find(y => y.username === String(b.username || '').trim().toLowerCase()), ph = normPhone(b.phone);
    if (x && x.role === 'customer' && x.phone && ph && x.phone === ph) { x.resetAt = new Date().toISOString(); save(db); }
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/password') {
    need(u); const b = await body(req), np = String(b.newPassword || '');
    if (!crypto.timingSafeEqual(Buffer.from(hash(String(b.oldPassword || ''), u.salt), 'hex'), Buffer.from(u.hash, 'hex'))) throw new Err(400, 'الباسورد القديم غلط');
    if (np.length < 6) throw new Err(400, 'الباسورد الجديد لازم 6 حروف على الأقل');
    u.salt = crypto.randomBytes(16).toString('hex'); u.hash = hash(np, u.salt); save(db); return send(res, 200, { ok: true });
  }
  let mr;
  if (m === 'GET' && p === '/api/users') { need(u, 'admin'); return send(res, 200, { users: db.users.filter(x => x.role === 'customer').map(x => ({ id: x.id, username: x.username, phone: x.phone || '', status: x.status || 'active', createdAt: x.createdAt || '', resetAt: x.resetAt || '' })).reverse() }); }
  mr = /^\/api\/users\/(\d+)$/.exec(p);
  if (m === 'DELETE' && mr) {
    need(u, 'admin'); const i = db.users.findIndex(y => y.id == mr[1] && y.role === 'customer'); if (i < 0) throw new Err(404, 'العميل مش موجود');
    const gone = db.users[i].id; db.users.splice(i, 1); for (const k of Object.keys(db.sessions)) if (db.sessions[k] === gone) delete db.sessions[k]; save(db); return send(res, 200, { ok: true });
  }
  mr = /^\/api\/users\/(\d+)\/reset$/.exec(p);
  if (m === 'POST' && mr) {
    need(u, 'admin'); const x = db.users.find(y => y.id == mr[1] && y.role === 'customer'); if (!x) throw new Err(404, 'العميل مش موجود');
    const al = 'abcdefghjkmnpqrstuvwxyz23456789'; let t = ''; for (const by of crypto.randomBytes(8)) t += al[by % al.length];
    x.salt = crypto.randomBytes(16).toString('hex'); x.hash = hash(t, x.salt); delete x.resetAt; save(db); return send(res, 200, { tempPassword: t });
  }
  if (m === 'POST' && p === '/api/logout') {
    const mm = /sid=([a-f0-9]+)/.exec(req.headers.cookie || ''); if (mm) sessions.delete(mm[1]);
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; Path=/; Max-Age=0' });
  }
  if (m === 'GET' && p === '/api/config') return send(res, 200, { ownerWhatsapp: OWNER_WHATSAPP });
  mr = /^\/api\/users\/(\d+)\/status$/.exec(p);
  if (m === 'POST' && mr) {
    need(u, 'admin'); const b = await body(req), x = db.users.find(y => y.id == mr[1] && y.role === 'customer'); if (!x) throw new Err(404, 'العميل مش موجود');
    if (!['active', 'pending', 'rejected'].includes(b.status)) throw new Err(400, 'حالة غير صحيحة'); x.status = b.status; save(db); return send(res, 200, { ok: true });
  }
  if (m === 'GET' && p === '/api/me') return send(res, 200, { user: pub(u) });
  if (m === 'GET' && p === '/api/products') return send(res, 200, { products: db.products });
  if (m === 'POST' && p === '/api/products') {
    need(u, 'admin'); const prod = { id: db.nextId++, ...cleanProduct(await body(req)) }; db.products.push(prod); save(db); return send(res, 201, { product: prod });
  }
  let mt = /^\/api\/products\/(\d+)$/.exec(p);
  if (mt && m === 'PUT') {
    need(u, 'admin'); const i = db.products.findIndex(x => x.id == mt[1]); if (i < 0) throw new Err(404, 'المنتج مش موجود');
    db.products[i] = { id: db.products[i].id, ...cleanProduct(await body(req)) }; save(db); return send(res, 200, { product: db.products[i] });
  }
  if (mt && m === 'DELETE') {
    need(u, 'admin'); const n = db.products.length; db.products = db.products.filter(x => x.id != mt[1]);
    if (db.products.length === n) throw new Err(404, 'المنتج مش موجود'); save(db); return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/orders') {
    need(u); if ((u.status || 'active') !== 'active') throw new Err(403, 'حسابك لسه مش مفعل، كلّم صاحب المتجر على واتساب عشان يتفعل');
    const b = await body(req); const items = [];
    if (!Array.isArray(b.items) || !b.items.length) throw new Err(400, 'السلة فاضية');
    for (const it of b.items) {
      const pr = db.products.find(x => x.id === it.id), q = parseInt(it.qty, 10);
      if (!pr || !(q > 0)) throw new Err(400, 'منتج غير صالح في السلة');
      if (pr.stock < q) throw new Err(400, `الكمية المتاحة من "${pr.name}" هي ${pr.stock} فقط`);
      items.push({ id: pr.id, name: pr.name, price: pr.price, qty: q });
    }
    const address = String(b.address || '').trim(); if (address.length < 5) throw new Err(400, 'اكتب العنوان');
    const phone = String(b.phone || '').trim(); if (!/^[0-9+ ]{8,15}$/.test(phone)) throw new Err(400, 'رقم التليفون غير صحيح');
    for (const it of items) db.products.find(x => x.id === it.id).stock -= it.qty;
    const order = { id: db.nextId++, userId: u.id, username: u.username, items, total: items.reduce((s, i) => s + i.price * i.qty, 0), address, phone, status: 'جديد', date: new Date().toISOString() };
    db.orders.push(order); save(db); return send(res, 201, { order });
  }
  if (m === 'GET' && p === '/api/orders') { need(u); return send(res, 200, { orders: (u.role === 'admin' ? db.orders : db.orders.filter(o => o.userId === u.id)).slice().reverse() }); }
  mt = /^\/api\/orders\/(\d+)\/status$/.exec(p);
  if (mt && m === 'PUT') {
    need(u, 'admin'); const o = db.orders.find(x => x.id == mt[1]); if (!o) throw new Err(404, 'الطلب مش موجود');
    const s = (await body(req)).status; if (!['جديد', 'تم الشحن', 'تم التسليم', 'ملغي'].includes(s)) throw new Err(400, 'حالة غير صحيحة');
    o.status = s; save(db); return send(res, 200, { order: o });
  }
  throw new Err(404, 'غير موجود');
}
function login(res, user) {
  const t = crypto.randomBytes(24).toString('hex'); sessions.set(t, user.id);
  send(res, 200, { user: pub(user) }, { 'Set-Cookie': `sid=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` });
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
function start() { http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    const f = url.pathname === '/' ? 'index.html' : path.basename(url.pathname);
    const fp = ['index.html','style.css','app.js'].includes(f) ? path.join(__dirname, f) : '/nonexistent';
    if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(fp)] || 'application/octet-stream' }); fs.createReadStream(fp).pipe(res);
  } catch (e) { send(res, e.code || 500, { error: e.code ? e.message : 'حصل خطأ في السيرفر' }); }
}).listen(PORT, () => console.log(`المتجر شغال على http://localhost:${PORT}`)); }
(async () => {
  let stored = null;
  if (process.env.DATABASE_URL) {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3 });
    await pool.query('CREATE TABLE IF NOT EXISTS store(id int primary key, data jsonb not null)');
    const r = await pool.query('SELECT data FROM store WHERE id=1'); stored = r.rows[0] && r.rows[0].data;
  }
  db = load(stored); db.sessions = db.sessions || {}; save(db); start();
})();
