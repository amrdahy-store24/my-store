/* Arabic <-> English UI switching. Arabic is the source language; English is applied at runtime. */
const LANG = (() => { try { return localStorage.getItem('lang') === 'en' ? 'en' : 'ar'; } catch { return 'ar'; } })();
const EN = {
'الدولة': 'Country', 'هيتحدد قريب': 'To be set soon', 'السعر في مصر (ج.م)': 'Price in Egypt (EGP)',
'المحافظة / المنطقة': 'Governorate / area', 'اختار...': 'Choose...', 'اختار المحافظة': 'Choose governorate', 'المدينة، الشارع، رقم العمارة': 'City, street, building no.', 'اختار المحافظة / المنطقة': 'Choose your governorate / area', 'مصاريف الشحن حسب المحافظة': 'Shipping fees by area', 'حفظ الشحن': 'Save shipping', 'اتحفظ الشحن ✓': 'Shipping saved ✓',
'حصل خطأ في السيرفر': 'Server error', 'حصل خطأ': 'Something went wrong', 'الوضع الفاتح': 'Light mode', 'الوضع الداكن': 'Dark mode',
'الرئيسية': 'Home', 'السلة': 'Cart', 'لوحة التحكم': 'Dashboard', 'طلباتي': 'My orders', 'خروج': 'Log out', 'دخول': 'Log in', 'حساب جديد': 'Sign up',
'إلكترونيات': 'Electronics', 'ملابس': 'Clothing', 'أدوات منزلية': 'Home goods', 'إكسسوارات': 'Accessories',
'● تشكيلة جديدة وصلت': '● New arrivals are here', 'تسوّق': 'Shop', 'أحلى المنتجات': 'the best products', 'بسعر وجودة تستاهلها': 'at a price and quality you deserve',
'اختار اللي يعجبك، اطلب في دقيقة، والدفع عند الاستلام لحد باب بيتك.': 'Pick what you like, order in a minute, and pay on delivery at your door.',
'تصفّح المنتجات': 'Browse products', 'تصفّح المنتجات ←': 'Browse products →', 'تسوّق العرض ←': 'Shop the offer →', 'تسوّق العرض': 'Shop the offer', 'عرض لفترة محدودة': 'Limited-time offer', 'عرض': 'Offer', 'العروض': 'Offers',
'السابق': 'Previous', 'التالي': 'Next', 'شريحة': 'Slide', 'توصيل سريع': 'Fast delivery', 'لحد باب البيت': 'Right to your door',
'الدفع عند الاستلام': 'Cash on delivery', 'ادفع وانت بتستلم': 'Pay when you receive', 'جودة مضمونة': 'Guaranteed quality', 'منتجات مختارة بعناية': 'Carefully selected products',
'المنتجات': 'Products', 'منتج': 'products', 'ابحث عن منتج...': 'Search for a product...', 'الكل': 'All', 'نفذت الكمية': 'Sold out', 'باقي': 'Only', 'فقط': 'left', 'ج.م': 'EGP', 'غير متاح': 'Unavailable', 'أضف للسلة': 'Add to cart',
'مفيش منتجات حاليًا، ارجع قريب.': 'No products right now, check back soon.', 'سجّل دخولك الأول عشان تشوف تفاصيل المنتج': 'Log in first to see product details', 'لازم تسجّل دخول الأول عشان تطلب': 'You need to log in first to order',
'وصلت للحد الأقصى المتاح من المنتج ده': 'You reached the maximum available quantity of this product', 'اتضاف للسلة ✓': 'Added to cart ✓', 'المنتج مش موجود': 'Product not found', 'متوفر': 'In stock',
'رجوع للمنتجات': 'Back to products', 'الوصف': 'Description', 'المواصفات': 'Specifications', 'عرض السلة': 'View cart', 'السلة فاضية': 'Your cart is empty', 'ابدأ التسوّق': 'Start shopping', 'ج.م للقطعة': 'EGP each', 'حذف': 'Remove',
'سلة المشتريات': 'Shopping cart', 'ملخص الطلب': 'Order summary', 'عدد القطع': 'Items', 'التوصيل': 'Delivery', 'يتحدد عند التأكيد': 'Set on confirmation', 'الإجمالي': 'Total', 'العنوان': 'Address', 'المحافظة، المدينة، الشارع': 'Governorate, city, street',
'رقم التليفون': 'Phone number', 'تأكيد الطلب': 'Place order', 'لازم تسجل دخول عشان تكمل الطلب.': 'Log in to complete your order.', 'الكمية المتاحة': 'Available quantity',
'تم تسجيل طلبك بنجاح ✓ هنتواصل معاك قريب': 'Your order was placed ✓ We will contact you soon', 'تحديث': 'Refresh', 'تعذّر تحميل الكود، اضغط تحديث': 'Could not load the code, tap refresh',
'إنشاء حساب جديد': 'Create a new account', 'أهلاً بيك تاني': 'Welcome back', 'سجّل في ثواني وابدأ اطلب': 'Sign up in seconds and start ordering', 'سجّل دخولك عشان تكمل طلباتك': 'Log in to continue your orders',
'اسم المستخدم': 'Username', 'رقم الموبايل': 'Mobile number', 'الباسورد': 'Password', 'كود التحقق (عشان نتأكد إنك مش روبوت)': 'Verification code (to make sure you are not a robot)', 'اكتب الحروف اللي في الصورة': 'Type the characters in the image',
'إنشاء الحساب': 'Create account', 'نسيت الباسورد؟': 'Forgot your password?', 'عندك حساب؟': 'Already have an account?', 'سجّل دخول': 'Log in', 'مش عندك حساب؟': "Don't have an account?", 'أنشئ حساب': 'Sign up', 'أهلاً': 'Hello',
'نسيت الباسورد': 'Forgot password', 'اكتب اسم المستخدم ورقم الموبايل اللي سجلت بيه، وهنبعتلك باسورد مؤقت على الواتساب.': 'Enter your username and the mobile number you registered with, and we will send you a temporary password on WhatsApp.',
'إرسال الطلب': 'Send request', 'رجوع لتسجيل الدخول': 'Back to log in', 'لو البيانات مظبوطة، طلبك وصل للإدارة وهيتواصلوا معاك على رقم الموبايل بباسورد مؤقت خلال وقت قصير.': 'If the details match, your request reached the admin and they will contact you on your mobile with a temporary password shortly.',
'اتغير الباسورد ✓': 'Password changed ✓', 'متأكد إنك عايز تحذف العميل': 'Are you sure you want to delete the customer', '؟ (طلباته القديمة هتفضل)': '? (their old orders will stay)', 'اتحذف العميل ✓': 'Customer deleted ✓',
'تعمل باسورد مؤقت جديد للعميل': 'Create a new temporary password for customer', 'الباسورد المؤقت:': 'Temporary password:', 'ابعته واتساب': 'Send on WhatsApp', 'جديد': 'New', 'تم الشحن': 'Shipped', 'تم التسليم': 'Delivered', 'ملغي': 'Cancelled', 'كل الطلبات': 'All orders',
'طلب #': 'Order #', 'مفيش طلبات لحد دلوقتي.': 'No orders yet.', 'تغيير الباسورد': 'Change password', 'الباسورد الحالي': 'Current password', 'الباسورد الجديد': 'New password', 'حفظ الباسورد الجديد': 'Save new password',
'الطلبات': 'Orders', 'طلبات جديدة': 'New orders', 'إجمالي المبيعات': 'Total sales', 'العملاء': 'Customers', 'تعديل منتج': 'Edit product', 'إضافة منتج': 'Add product', 'الاسم': 'Name', 'السعر (ج.م)': 'Price (EGP)', 'القسم': 'Category',
'اختار قسم أو اكتب قسم جديد': 'Pick a category or type a new one', 'صورة المنتج (اختياري - ارفع صورة أو حط رابط)': 'Product image (optional - upload or paste a link)', 'حفظ التعديل': 'Save changes', '＋ إضافة المنتج': '+ Add product', 'إلغاء': 'Cancel',
'شرائح العروض (السلايدر أعلى الصفحة الرئيسية)': 'Offer slides (slider at the top of home)', 'ظاهر في الصفحة الرئيسية': 'Shown on the home page', 'عنوان صغير فوق كل عرض (اختياري، مثلاً: عرض)': 'Small label above each offer (optional, e.g. Offer)',
'نص العروض (كل سطر عرض = شريحة منفصلة في السلايدر)': 'Offers text (each line = a separate slide)', 'حفظ العرض': 'Save offer', 'العملاء المسجلين': 'Registered customers', 'تعديل': 'Edit', 'لسه مفيش منتجات.': 'No products yet.', 'طلب نسيان باسورد': 'Forgot-password request',
'بدون رقم': 'No number', 'باسورد مؤقت': 'Temp password', 'لسه مفيش عملاء.': 'No customers yet.', 'مفيش طلبات.': 'No orders.', 'اتحفظ العرض ✓': 'Offer saved ✓', 'متأكد إنك عايز تحذف المنتج؟': 'Delete this product?', 'اتحذف ✓': 'Deleted ✓', 'صورة غير صالحة': 'Invalid image', 'اتعدل ✓': 'Updated ✓', 'اتضاف ✓': 'Added ✓',
'تِكمو': 'Tekmoo', 'تسوّق بثقة': 'Shop with confidence', 'تبديل الوضع': 'Toggle theme', 'جودة تستاهلها • توصيل لحد باب البيت • الدفع عند الاستلام': 'Quality you deserve • Delivery to your door • Cash on delivery', '© جميع الحقوق محفوظة': '© All rights reserved',
'بيانات غير صالحة': 'Invalid data', 'سجّل دخولك الأول': 'Log in first', 'غير مسموح': 'Not allowed', 'اسم المنتج مطلوب': 'Product name is required', 'السعر غير صحيح': 'Invalid price', 'الكمية غير صحيحة': 'Invalid quantity', 'رابط الصورة غير صحيح': 'Invalid image link',
'كود التحقق انتهى، اضغط تحديث واكتبه تاني': 'The code expired, tap refresh and enter it again', 'كود التحقق اتستخدم قبل كده، اضغط تحديث': 'This code was already used, tap refresh', 'كود التحقق غلط، جرّب الكود الجديد': 'Wrong code, try the new one',
'اليوزر 3-20 حرف إنجليزي أو أرقام أو _ .': 'Username: 3-20 English letters, numbers, _ or .', 'الباسورد لازم 6 حروف على الأقل': 'Password must be at least 6 characters', 'اليوزر ده مستخدم، اختار غيره': 'Username already taken, choose another', 'اكتب رقم موبايل مصري صحيح (مثال 01012345678)': 'Enter a valid Egyptian mobile number (e.g. 01012345678)',
'الرقم ده مسجل بحساب تاني': 'This number is registered to another account', 'اليوزر أو الباسورد غلط': 'Wrong username or password', 'الباسورد القديم غلط': 'Current password is wrong', 'الباسورد الجديد لازم 6 حروف على الأقل': 'New password must be at least 6 characters', 'العميل مش موجود': 'Customer not found', 'منتج غير صالح في السلة': 'Invalid product in cart',
'اكتب العنوان': 'Enter the address', 'رقم التليفون غير صحيح': 'Invalid phone number', 'الطلب مش موجود': 'Order not found', 'حالة غير صحيحة': 'Invalid status', 'غير موجود': 'Not found',
/* menu */ 'القائمة': 'Menu', 'حسابي': 'My account', 'تسجيل الخروج': 'Log out', 'الأقسام': 'Categories', 'الدعم الفني': 'Technical support', 'تواصل معنا': 'Contact us', 'الإعدادات': 'Settings', 'اللغة': 'Language', 'المظهر': 'Theme', 'فاتح': 'Light', 'داكن': 'Dark',
'إغلاق': 'Close', 'مفيش أقسام لسه': 'No categories yet', 'محتاج مساعدة؟ كلّمنا واتساب': 'Need help? Chat with us on WhatsApp', 'واتساب': 'WhatsApp', 'اتصال': 'Call', 'سجّل الدخول أو أنشئ حساب': 'Log in or create an account', 'مرحبًا': 'Hi'
};
const RX = [
 [/باقي (\d+) فقط/g, 'Only $1 left'], [/(\d[\d,]*)\s*منتج\b/g, '$1 products'], [/ج\.م • الكمية (\d+)/g, 'EGP • Qty $1'], [/ج\.م •/g, 'EGP •'], [/الكمية المتاحة من (.+?) هي (\d+)/g, 'Available quantity of $1 is $2'],
 [/، الباسورد المؤقت بتاعك للمتجر:/g, ', your temporary password for the store:'], [/\. ادخل بيه وغيّره من صفحة طلباتي\./g, '. Log in with it and change it from My orders.'],
];
const KEYS = Object.keys(EN).sort((a, b) => b.length - a.length);
const HAS_AR = /[\u0600-\u06FF]/;
function T(s) {
  if (LANG !== 'en' || !s || !HAS_AR.test(s)) return s;
  const t = s.trim(); if (EN[t]) return s.replace(t, EN[t]);
  for (const [r, v] of RX) s = s.replace(r, v);
  for (const k of KEYS) if (s.includes(k)) s = s.split(k).join(EN[k]);
  return s;
}
function trNode(root) {
  if (LANG !== 'en') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const L = []; for (let n = w.nextNode(); n; n = w.nextNode()) if (HAS_AR.test(n.nodeValue)) L.push(n);
  L.forEach(n => { n.nodeValue = T(n.nodeValue); });
  if (root.querySelectorAll) root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(e => ['placeholder', 'title', 'aria-label'].forEach(a => { const v = e.getAttribute(a); if (v && HAS_AR.test(v)) e.setAttribute(a, T(v)); }));
}
if (LANG === 'en') {
  document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
  const oc = window.confirm.bind(window); window.confirm = m => oc(T(m));
  const mo = new MutationObserver(ms => { mo.disconnect(); ms.forEach(m => { if (m.type === 'characterData') { if (HAS_AR.test(m.target.nodeValue)) m.target.nodeValue = T(m.target.nodeValue); } else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName); if (v && HAS_AR.test(v)) m.target.setAttribute(m.attributeName, T(v)); } else m.addedNodes.forEach(n => { if (n.nodeType === 3) { if (HAS_AR.test(n.nodeValue)) n.nodeValue = T(n.nodeValue); } else if (n.nodeType === 1) trNode(n); }); }); mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] }); });
  document.addEventListener('DOMContentLoaded', () => { trNode(document.body); document.title = 'Tekmoo'; mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] }); });
}
function setLang(l) { try { localStorage.setItem('lang', l); } catch {} location.reload(); }
