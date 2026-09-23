import React from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider, useTranslation } from './lib/i18n';
import ProductClassificationBadge from './components/dashboard/analytics/ProductClassificationBadge';

function DeepChild() {
  const { t } = useTranslation();
  return <div><span data-testid="product">{t('admin.products.create_new_product')}</span><ProductClassificationBadge value="hidden_opportunity" /></div>;
}
function Controls() {
  const { lang, setLang, t } = useTranslation();
  return <main><p data-testid="lang">{lang}</p><p data-testid="auth">{t('admin.auth.welcome_back')}</p><DeepChild />{['fr', 'en', 'ar'].map((value) => <button type="button" key={value} onClick={() => setLang(value)}>{value}</button>)}</main>;
}
createRoot(document.getElementById('root')).render(<I18nProvider><Controls /></I18nProvider>);
