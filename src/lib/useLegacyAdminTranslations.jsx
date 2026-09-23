import { useEffect, useRef } from "react";
import { useTranslation } from "./i18n";

// This compatibility layer keeps the existing, large administrator area
// localized while each screen is migrated to `t("admin.…")` keys. It only
// changes known interface copy and deliberately leaves user-entered content,
// product names, and server data untouched.
const legacyCopy = {
  fr: {
    "Create New Product": "Créer un produit",
    "Update Product": "Mettre à jour le produit",
    "No product found": "Aucun produit trouvé",
    "Fill in the details below to add a new item to your inventory.": "Renseignez les détails ci-dessous pour ajouter un article à votre inventaire.",
    "Fill in the details below to add update items.": "Renseignez les détails ci-dessous pour mettre à jour les articles.",
    "All statuses": "Tous les statuts",
    "Published": "Publié",
    "Draft": "Brouillon",
    "Closed": "Fermé",
    "Review": "Révision",
    "Scheduled": "Programmé",
    "Archived": "Archivé",
    "Featured": "En vedette",
    "Not featured": "Non mis en avant",
    "Newest first": "Plus récents d’abord",
    "Oldest first": "Plus anciens d’abord",
    "Title A → Z": "Titre A → Z",
    "Title Z → A": "Titre Z → A",
    "Location A → Z": "Lieu A → Z",
    "Location Z → A": "Lieu Z → A",
    "Name A–Z": "Nom A–Z",
    "No articles found": "Aucun article trouvé",
    "No versions yet.": "Aucune version pour le moment.",
    "News Management": "Gestion des actualités",
    "Create article": "Créer un article",
    "Edit article": "Modifier l’article",
    "Archive article?": "Archiver l’article ?",
    "All categories": "Toutes les catégories",
    "All authors": "Tous les auteurs",
    "Featured or standard": "En vedette ou standard",
    "Contact Submissions": "Messages de contact",
    "User Management": "Gestion des utilisateurs",
    "Users": "Utilisateurs",
    "Permissions": "Autorisations",
    "All permissions (immutable)": "Toutes les autorisations (immuables)",
    "Account security": "Sécurité du compte",
    "Current password": "Mot de passe actuel",
    "New password": "Nouveau mot de passe",
    "Confirm password": "Confirmer le mot de passe",
    "Change password": "Modifier le mot de passe",
    "Save changes": "Enregistrer les modifications",
    "Personal information": "Informations personnelles",
    "Profile": "Profil",
    "Leads": "Prospects",
    "No leads found": "Aucun prospect trouvé",
    "All assignees": "Tous les assignés",
    "Unassigned": "Non attribué",
    "All products": "Tous les produits",
    "All sources": "Toutes les sources",
    "Customer": "Client",
    "Interest": "Intérêt",
    "Assigned": "Attribué",
    "Follow-up": "Suivi",
    "Value": "Valeur",
    "Quotation Requests": "Demandes de devis",
    "Activity Logs": "Journal d’activité",
    "Hiring": "Recrutement",
    "Job posts": "Offres d’emploi",
    "Position": "Poste",
    "Location": "Lieu",
    "Type": "Type",
    "Publish date": "Date de publication",
    "Create job post": "Créer une offre d’emploi",
    "Edit job post": "Modifier l’offre d’emploi",
    "Search assigned products…": "Rechercher des produits attribués…",
    "Assign Products": "Attribuer des produits",
    "No matching products.": "Aucun produit correspondant.",
    "Visible": "Visible",
    "Hidden": "Masqué",
    "Remove": "Retirer",
    "Replace": "Remplacer",
    "Image": "Image",
    "SEO title": "Titre SEO",
    "SEO description": "Description SEO",
    "Display order": "Ordre d’affichage",
    "Visible in public catalog": "Visible dans le catalogue public",
    "Delete permanently": "Supprimer définitivement",
    "Deleting…": "Suppression...",
    "Parent Family": "Famille parente",
    "Sub Families": "Sous-familles",
    "Products": "Produits",
    "Catalog taxonomy": "Taxonomie du catalogue",
    "Product editor": "Éditeur de produit",
    "New product": "Nouveau produit",
    "Create product": "Créer le produit",
    "Edit product": "Modifier le produit",
    "Product identity": "Identité du produit",
    "Product name": "Nom du produit",
    "Serial number": "Numéro de série",
    "Active product": "Produit actif",
    "Available for ecommerce": "Disponible pour le commerce en ligne",
    "Pricing": "Tarification",
    "Product price": "Prix du produit",
    "Shipping price": "Prix de livraison",
    "Classification": "Classification",
    "Publication status": "Statut de publication",
    "URL slug": "Slug d’URL",
    "Product content": "Contenu du produit",
    "Short description": "Description courte",
    "Full description": "Description complète",
    "Technical information": "Informations techniques",
    "Material": "Matériau",
    "Finishes": "Finitions",
    "Dimensions": "Dimensions",
    "Installation": "Installation",
    "Applications": "Applications",
    "Documents": "Documents",
    "Product variants": "Variantes du produit",
    "Product media": "Médias du produit",
    "Search optimization": "Optimisation de recherche",
    "Canonical URL": "URL canonique",
    "Hide from search engines": "Masquer des moteurs de recherche",
    "Article": "Article",
    "Excerpt": "Extrait",
    "Related Products": "Produits associés",
    "SEO & Social": "SEO et réseaux sociaux",
    "Publishing": "Publication",
    "Date & time": "Date et heure",
    "Cover image": "Image de couverture",
    "Upload": "Téléverser",
    "Organization": "Organisation",
    "Category": "Catégorie",
    "Tags": "Étiquettes",
    "Version History": "Historique des versions",
    "Current": "Actuel",
    "Basic information": "Informations de base",
    "Full name": "Nom complet",
    "Phone number": "Numéro de téléphone",
    "Email address": "Adresse e-mail",
    "Profile image URL": "URL de l’image de profil",
    "Password & security": "Mot de passe et sécurité",
    "Account details": "Détails du compte",
    "Role": "Rôle",
    "Member since": "Membre depuis",
    "Last updated": "Dernière mise à jour",
    "Protected": "Protégé",
    "Not configured": "Non configuré",
    "Management": "Gestion",
    "Internal notes": "Notes internes",
    "Timeline": "Chronologie",
  },
  ar: {
    "Create New Product": "إنشاء منتج جديد",
    "Update Product": "تحديث المنتج",
    "No product found": "لم يتم العثور على منتج",
    "Fill in the details below to add a new item to your inventory.": "أدخل التفاصيل أدناه لإضافة عنصر جديد إلى المخزون.",
    "Fill in the details below to add update items.": "أدخل التفاصيل أدناه لتحديث العناصر.",
    "All statuses": "كل الحالات",
    "Published": "منشور",
    "Draft": "مسودة",
    "Closed": "مغلق",
    "Review": "مراجعة",
    "Scheduled": "مجدول",
    "Archived": "مؤرشف",
    "Featured": "مميز",
    "Not featured": "غير مميز",
    "Newest first": "الأحدث أولاً",
    "Oldest first": "الأقدم أولاً",
    "Title A → Z": "العنوان أ → ي",
    "Title Z → A": "العنوان ي → أ",
    "Location A → Z": "الموقع أ → ي",
    "Location Z → A": "الموقع ي → أ",
    "Name A–Z": "الاسم أ–ي",
    "No articles found": "لم يتم العثور على مقالات",
    "No versions yet.": "لا توجد إصدارات بعد.",
    "News Management": "إدارة الأخبار",
    "Create article": "إنشاء مقال",
    "Edit article": "تعديل المقال",
    "Archive article?": "أرشفة المقال؟",
    "All categories": "كل التصنيفات",
    "All authors": "كل المؤلفين",
    "Featured or standard": "مميز أو عادي",
    "Contact Submissions": "رسائل التواصل",
    "User Management": "إدارة المستخدمين",
    "Users": "المستخدمون",
    "Permissions": "الصلاحيات",
    "All permissions (immutable)": "كل الصلاحيات (غير قابلة للتغيير)",
    "Account security": "أمان الحساب",
    "Current password": "كلمة المرور الحالية",
    "New password": "كلمة المرور الجديدة",
    "Confirm password": "تأكيد كلمة المرور",
    "Change password": "تغيير كلمة المرور",
    "Save changes": "حفظ التغييرات",
    "Personal information": "المعلومات الشخصية",
    "Profile": "الملف الشخصي",
    "Leads": "العملاء المحتملون",
    "No leads found": "لم يتم العثور على عملاء محتملين",
    "All assignees": "كل المكلّفين",
    "Unassigned": "غير مكلّف",
    "All products": "كل المنتجات",
    "All sources": "كل المصادر",
    "Customer": "العميل",
    "Interest": "الاهتمام",
    "Assigned": "مكلّف",
    "Follow-up": "متابعة",
    "Value": "القيمة",
    "Quotation Requests": "طلبات عروض الأسعار",
    "Activity Logs": "سجل النشاط",
    "Hiring": "التوظيف",
    "Job posts": "إعلانات الوظائف",
    "Position": "المنصب",
    "Location": "الموقع",
    "Type": "النوع",
    "Publish date": "تاريخ النشر",
    "Create job post": "إنشاء إعلان وظيفة",
    "Edit job post": "تعديل إعلان الوظيفة",
    "Search assigned products…": "البحث عن المنتجات المعيّنة…",
    "Assign Products": "تعيين المنتجات",
    "No matching products.": "لا توجد منتجات مطابقة.",
    "Visible": "مرئي",
    "Hidden": "مخفي",
    "Remove": "إزالة",
    "Replace": "استبدال",
    "Image": "صورة",
    "SEO title": "عنوان SEO",
    "SEO description": "وصف SEO",
    "Display order": "ترتيب العرض",
    "Visible in public catalog": "ظاهر في الكتالوج العام",
    "Delete permanently": "حذف نهائي",
    "Deleting…": "جارٍ الحذف...",
    "Parent Family": "العائلة الرئيسية",
    "Sub Families": "العائلات الفرعية",
    "Products": "المنتجات",
    "Catalog taxonomy": "تصنيف الكتالوج",
    "Product editor": "محرر المنتج",
    "New product": "منتج جديد",
    "Create product": "إنشاء المنتج",
    "Edit product": "تعديل المنتج",
    "Product identity": "هوية المنتج",
    "Product name": "اسم المنتج",
    "Serial number": "الرقم التسلسلي",
    "Active product": "منتج نشط",
    "Available for ecommerce": "متاح للتجارة الإلكترونية",
    "Pricing": "التسعير",
    "Product price": "سعر المنتج",
    "Shipping price": "سعر الشحن",
    "Classification": "التصنيف",
    "Publication status": "حالة النشر",
    "URL slug": "الاسم المختصر للرابط",
    "Product content": "محتوى المنتج",
    "Short description": "وصف قصير",
    "Full description": "وصف كامل",
    "Technical information": "المعلومات الفنية",
    "Material": "المادة",
    "Finishes": "التشطيبات",
    "Dimensions": "الأبعاد",
    "Installation": "التركيب",
    "Applications": "الاستخدامات",
    "Documents": "المستندات",
    "Product variants": "متغيرات المنتج",
    "Product media": "وسائط المنتج",
    "Search optimization": "تحسين البحث",
    "Canonical URL": "الرابط الأساسي",
    "Hide from search engines": "إخفاء من محركات البحث",
    "Article": "المقال",
    "Excerpt": "مقتطف",
    "Related Products": "منتجات ذات صلة",
    "SEO & Social": "SEO والشبكات الاجتماعية",
    "Publishing": "النشر",
    "Date & time": "التاريخ والوقت",
    "Cover image": "صورة الغلاف",
    "Upload": "رفع",
    "Organization": "التنظيم",
    "Category": "التصنيف",
    "Tags": "الوسوم",
    "Version History": "سجل الإصدارات",
    "Current": "الحالي",
    "Basic information": "المعلومات الأساسية",
    "Full name": "الاسم الكامل",
    "Phone number": "رقم الهاتف",
    "Email address": "عنوان البريد الإلكتروني",
    "Profile image URL": "رابط صورة الملف الشخصي",
    "Password & security": "كلمة المرور والأمان",
    "Account details": "تفاصيل الحساب",
    "Role": "الدور",
    "Member since": "عضو منذ",
    "Last updated": "آخر تحديث",
    "Protected": "محمي",
    "Not configured": "غير مهيأ",
    "Management": "الإدارة",
    "Internal notes": "ملاحظات داخلية",
    "Timeline": "الخط الزمني",
  },
};

const attributes = ["aria-label", "placeholder", "title"];
const ignoredTags = new Set(["SCRIPT", "STYLE", "TEXTAREA"]);

export function useLegacyAdminTranslations(rootRef) {
  const { lang } = useTranslation();
  const originals = useRef(new WeakMap());
  const attributeOriginals = useRef(new WeakMap());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const translate = (value) => {
      const source = String(value || "");
      const leading = source.match(/^\s*/)?.[0] || "";
      const trailing = source.match(/\s*$/)?.[0] || "";
      const text = source.trim();
      const translated = lang === "en" ? text : legacyCopy[lang]?.[text];
      return translated ? `${leading}${translated}${trailing}` : source;
    };

    const scan = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (ignoredTags.has(node.parentElement?.tagName)) continue;
        if (!originals.current.has(node)) {
          const source = String(node.nodeValue || "").trim();
          if (!Object.hasOwn(legacyCopy.fr, source)) continue;
          originals.current.set(node, node.nodeValue);
        }
        const nextValue = translate(originals.current.get(node));
        if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
      }

      root.querySelectorAll("*").forEach((element) => {
        attributes.forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return;
          if (!attributeOriginals.current.has(element)) attributeOriginals.current.set(element, new Map());
          const values = attributeOriginals.current.get(element);
          if (!values.has(attribute)) {
            const source = String(element.getAttribute(attribute) || "").trim();
            if (!Object.hasOwn(legacyCopy.fr, source)) return;
            values.set(attribute, element.getAttribute(attribute));
          }
          const nextValue = translate(values.get(attribute));
          if (element.getAttribute(attribute) !== nextValue) {
            element.setAttribute(attribute, nextValue);
          }
        });
      });
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [lang, rootRef]);
}
