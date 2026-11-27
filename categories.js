// شجرة الأقسام — تستخدم في السيرفر (require) وفي المتصفح (window.CATEGORIES)
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CATEGORIES = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const t = (id, name, children) => ({ id, name, children: (children || []).map(([ci, cn]) => ({ id: id + '.' + ci, name: cn })) });
  return [
    t('electronics', 'إلكترونيات', [
      ['phones', 'موبايلات'],
      ['laptops', 'لابتوب'],
      ['desktops', 'كمبيوتر وتجميعات'],
      ['tablets', 'تابلت'],
      ['headphones', 'سماعات'],
      ['monitors', 'شاشات'],
      ['phone-accessories', 'إكسسوارات موبايل'],
      ['monitor-stands', 'حوامل شاشات'],
      ['smartwatches', 'ساعات ذكية'],
      ['cameras', 'كاميرات'],
      ['tvs', 'تلفزيونات'],
      ['keyboard-mouse', 'كيبورد وماوس'],
      ['chargers', 'شواحن وباور بانك'],
      ['routers', 'راوتر وشبكات'],
      ['gaming', 'ألعاب فيديو'],
      ['smart-home', 'أجهزة منزلية ذكية']
    ]),
    t('clothing', 'ملابس', [
      ['men', 'ملابس رجالي'],
      ['women', 'ملابس حريمي'],
      ['kids', 'ملابس أطفال'],
      ['shoes', 'أحذية'],
      ['bags', 'شنط'],
      ['sportswear', 'ملابس رياضية'],
      ['underwear', 'ملابس داخلية'],
      ['abayas', 'عبايات وحجاب']
    ]),
    t('personal-care', 'عناية شخصية', [
      ['perfumes', 'عطور'],
      ['makeup', 'مكياج'],
      ['skincare', 'عناية بالبشرة'],
      ['haircare', 'عناية بالشعر'],
      ['body-care', 'عناية بالجسم'],
      ['shaving', 'حلاقة وأدوات'],
      ['makeup-tools', 'أدوات مكياج']
    ]),
    t('men-accessories', 'إكسسوارات رجالية', [
      ['wallets', 'محافظ'],
      ['watches', 'ساعات رجالي'],
      ['belts', 'أحزمة'],
      ['eyewear', 'نظارات'],
      ['ties', 'كرافاتات'],
      ['cufflinks', 'أزرار قمصان']
    ]),
    t('women-accessories', 'إكسسوارات نسائية', [
      ['jewelry', 'مجوهرات'],
      ['handbags', 'شنط حريمي'],
      ['scarves', 'إيشاربات وأوشحة'],
      ['sunglasses', 'نظارات شمسية'],
      ['hair-accessories', 'إكسسوارات شعر'],
      ['watches', 'ساعات حريمي']
    ]),
    t('kids-toys', 'ألعاب أطفال', [
      ['educational', 'ألعاب تعليمية'],
      ['dolls', 'عرائس ودباديب'],
      ['rc-cars', 'عربيات وريموت'],
      ['blocks', 'مكعبات وليجو'],
      ['outdoor', 'ألعاب خارجية'],
      ['baby', 'ألعاب أطفال رضع']
    ]),
    t('car-accessories', 'إكسسوارات سيارات', [
      ['interior', 'كماليات داخلية'],
      ['exterior', 'إكسسوارات خارجية'],
      ['chargers', 'شواحن وكابلات'],
      ['phone-holders', 'حوامل موبايل'],
      ['seat-covers', 'أغطية كراسي'],
      ['car-care', 'معطرات وعناية']
    ]),
    t('home', 'أدوات منزلية', [
      ['kitchen', 'أدوات مطبخ'],
      ['storage', 'تنظيم وتخزين'],
      ['decor', 'ديكور'],
      ['bedding', 'مفروشات'],
      ['lighting', 'إضاءة'],
      ['cleaning', 'أدوات نظافة']
    ]),
    t('appliances', 'أجهزة منزلية', [
      ['small-kitchen', 'أجهزة مطبخ صغيرة'],
      ['vacuums', 'مكانس كهربائية'],
      ['cooling', 'تكييف ومراوح'],
      ['washers', 'غسالات']
    ]),
    t('sports', 'رياضة ولياقة', [
      ['gym', 'أدوات جيم'],
      ['sportswear', 'ملابس وأحذية رياضية'],
      ['bikes', 'دراجات'],
      ['outdoor', 'رياضات خارجية']
    ]),
    t('baby', 'أطفال ومستلزماتهم', [
      ['strollers', 'عربيات أطفال'],
      ['car-seats', 'كراسي سيارة'],
      ['feeding', 'مستلزمات رضاعة'],
      ['diapers', 'حفاضات ومناديل']
    ]),
    t('books', 'كتب وأدوات مكتبية', [
      ['books', 'كتب'],
      ['pens', 'أقلام ودفاتر'],
      ['school', 'أدوات مدرسية']
    ]),
    t('tools', 'أدوات ومعدات', [
      ['hand-tools', 'عدد يدوية'],
      ['power-tools', 'عدد كهربائية'],
      ['electrical', 'مستلزمات كهرباء']
    ]),
    t('health', 'صحة وعناية', [
      ['devices', 'أجهزة قياس'],
      ['supplements', 'مكملات غذائية'],
      ['medical', 'مستلزمات طبية']
    ]),
    t('pets', 'حيوانات أليفة', [
      ['food', 'أكل'],
      ['accessories', 'أدوات'],
      ['toys', 'ألعاب']
    ]),
    t('gifts', 'هدايا ومناسبات', [
      ['men', 'هدايا رجالية'],
      ['women', 'هدايا نسائية'],
      ['kids', 'هدايا أطفال']
    ]),
    t('other', 'أقسام أخرى', [
      ['misc', 'منتجات متنوعة']
    ])
  ];
});
