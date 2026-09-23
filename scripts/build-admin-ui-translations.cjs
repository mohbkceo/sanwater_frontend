const fs = require('node:fs');
const catalog = JSON.parse(fs.readFileSync('scripts/admin-jsx-catalog.json', 'utf8'));
const cache = JSON.parse(fs.readFileSync('scripts/admin-translation-cache.json', 'utf8'));
const existing = JSON.parse(fs.readFileSync('scripts/admin-existing.json', 'utf8'));

const overrides = {
  fr: {
    'analytics.commercial_definition_sentence': 'Définition commerciale : {{orders}} ; le chiffre d’affaires correspond à {{revenue}}. {{attribution}}',
    'sales.region_number': 'Région {{number}}',
    'leads.status_transition': '{{from}} → {{to}}',
    'leads.quantity_source': 'Quantité {{quantity}} · {{source}}',
    'leads.note_by_author': '{{author}} : {{content}}',
    'news.version_number_reason': 'Version {{version}} · {{reason}}',
    'news.by_author': 'Par {{author}}',
    'profile.password_strength_score': '{{label}} · {{score}}/5',
    'activity.field_value': '{{field}} : {{value}}',
    'activity.value_change': '{{before}} → {{after}}',
    'sales.office_sections': 'Sections des agences',
    'sales.office': 'Agence n°',
    'sales.office_card': 'Fiche de l’agence',
    'sales.sales_block': 'Bloc commercial n°',
    'hiring.draft': 'Brouillon',
    'hiring.status_draft': 'Brouillon',
    'news.draft': 'Brouillon',
    'news.status_draft': 'Brouillon',
    'products.draft': 'Brouillon',
    'news.status_review': 'En relecture',
    'users.permission_group_submissions': 'Messages de contact',
    'users.permission_group_leads': 'Prospects commerciaux',
    'users.permission_view_hiring': 'Voir les offres d’emploi',
    'users.permission_manage_hiring': 'Gérer les offres d’emploi',
    'users.permission_view_submissions': 'Voir les messages de contact',
    'users.permission_manage_submissions': 'Gérer les messages de contact',
  },
  ar: {
    'auth.login_description': 'سجّل الدخول لإدارة لوحة تحكم San Water.',
    'auth.promo_title': 'إدارة San Water بثقة',
    'auth.create_account_description': 'أضف عضوًا جديدًا إلى فريق لوحة تحكم San Water.',
    'news.plan_write_review_and_publish_san_water_stories': 'خطّط لأخبار San Water واكتبها وراجعها وانشرها.',
    'analytics.commercial_definition_sentence': 'التعريف التجاري: {{orders}}؛ والإيرادات هي {{revenue}}. {{attribution}}',
    'sales.region_number': 'المنطقة {{number}}',
    'sales.sales_block_number': 'القسم التجاري {{number}}',
    'hiring.one_result': 'نتيجة واحدة ({{count}})',
    'hiring.result_count': '{{count}} نتائج',
    'leads.status_transition': '{{from}} ← {{to}}',
    'leads.lead_count': '{{count}} من العملاء المحتملين',
    'leads.quantity_source': 'الكمية {{quantity}} · المصدر: {{source}}',
    'leads.note_by_author': '{{author}}: {{content}}',
    'news.version_number_reason': 'الإصدار {{version}} · {{reason}}',
    'news.by_author': 'بقلم {{author}}',
    'profile.password_strength_score': '{{label}} · {{score}}/5',
    'common.page_of': 'الصفحة {{page}} من {{total}}',
    'activity.values_more': '{{values}} و{{count}} أخرى',
    'activity.field_value': '{{field}}: {{value}}',
    'activity.image_change': '{{count}} صورة',
    'activity.images_change': '{{count}} صور',
    'activity.value_change': '{{before}} ← {{after}}',
    'sales.office_sections': 'أقسام الفروع',
    'sales.office': 'الفرع رقم',
    'sales.office_card': 'بطاقة الفرع',
    'hiring.delete_job_post': 'حذف إعلان الوظيفة',
    'leads.sales_leads': 'العملاء المحتملون',
    'leads.manage_inquiry_follow_up_qualification_quote_and_outcome': 'إدارة الاستفسارات والمتابعة والتأهيل وعروض الأسعار والنتائج.',
    'leads.leads': 'عملاء محتملون',
    'leads.status_quote_sent': 'تم إرسال عرض السعر',
    'leads.status_won': 'ناجح',
    'leads.status_lost': 'لم ينجح',
    'quotations.quotation_requests': 'طلبات عروض الأسعار',
    'users.permission_group_leads': 'العملاء المحتملون',
    'users.permission_view_quotations': 'عرض طلبات عروض الأسعار',
    'users.permission_group_submissions': 'رسائل التواصل',
    'users.permission_view_submissions': 'عرض رسائل التواصل',
    'users.permission_manage_submissions': 'إدارة رسائل التواصل',
    'users.permission_group_users': 'إدارة المستخدمين',
    'users.permission_view_leads': 'عرض العملاء المحتملين',
    'users.permission_manage_leads': 'إدارة العملاء المحتملين',
    'news.status_scheduled': 'مجدول',
  },
};

const result = { en: {}, fr: {}, ar: {} };
const vars = (text) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort().join(',');
for (const [namespace, entries] of Object.entries(catalog)) {
  for (const [key, value] of Object.entries(entries)) {
    if (existing.en[namespace]?.[key] === value) continue;
    for (const lang of ['en', 'fr', 'ar']) {
      const text = lang === 'en' ? value : overrides[lang]?.[`${namespace}.${key}`] || cache[lang][value];
      if (!text) throw new Error(`Missing ${lang}: admin.${namespace}.${key}`);
      if (vars(value) !== vars(text)) throw new Error(`Interpolation mismatch: ${lang} admin.${namespace}.${key}: ${text}`);
      (result[lang][namespace] ||= {})[key] = text;
    }
  }
}
const output = `// Admin UI copy rendered through useTranslation(). Keep all locale key structures in sync.\n` +
  ['en', 'fr', 'ar'].map((lang) => `const ${lang} = ${JSON.stringify(result[lang], null, 2)};`).join('\n\n') +
  '\n\nexport const adminUiTranslations = { en, fr, ar };\n';
fs.writeFileSync('src/lib/i18n_admin_ui.js', output);
console.log(`Generated ${Object.values(result.en).reduce((count, keys) => count + Object.keys(keys).length, 0)} shared admin UI keys per language`);
