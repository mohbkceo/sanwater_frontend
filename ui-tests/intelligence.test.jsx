import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Analytics from '../src/routes/sanwatergroup/dashboard/pages/Analytics';
import IntelligenceDomain from '../src/routes/sanwatergroup/dashboard/pages/IntelligenceDomain';
import SubjectIntelligence from '../src/routes/sanwatergroup/dashboard/pages/SubjectIntelligence';
import { MetricCard } from '../src/components/dashboard/intelligence/ui';
import { I18nProvider } from '../src/lib/i18n';
import { fetchDashboard, fetchDomain, fetchSubject } from '../src/services/analytics/analytics';

vi.mock('../src/services/analytics/analytics', () => ({ fetchDashboard: vi.fn(), fetchDomain: vi.fn(), fetchSubject: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.removeItem('lang'); document.documentElement.dir = 'ltr'; });
function Path() { const location = useLocation(); return <p data-testid="path">{location.pathname}{location.search}</p>; }
function mount(path, route, element) { return render(<MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={element} /><Route path="/sanwater/admins/secure/subjects/:type/:id" element={<Path />} /></Routes></MemoryRouter>); }

describe('intelligence screens', () => {
  it('selects persona dashboard sections, shows comparison, and opens evidence', async () => {
    fetchDashboard.mockResolvedValue({ persona: 'product_manager', visibleDomains: ['products'], sections: { products: { kpis: { revenue: { current: 1200, previous: 1000, percentageChange: 20 } } } }, attention: [{ id: 'p', domain: 'products', severity: 'warning', title: 'Hidden opportunity', explanation: 'High conversion with low demand.', evidence: { uniqueViews: 30, siteMedianViews: 90 }, recommendedInspection: 'Review visibility', targetRoute: '/sanwater/admins/secure/subjects/product/abc' }] });
    mount('/sanwater/admins/secure?from=2026-09-01&to=2026-09-30', '/sanwater/admins/secure', <Analytics />);
    expect(screen.getByLabelText('Loading analytics')).toBeTruthy();
    expect(await screen.findByText('Hidden opportunity')).toBeTruthy();
    expect(screen.getByText('+20.0% vs previous period')).toBeTruthy();
    expect(screen.queryByText('Hiring')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show evidence' }));
    expect(screen.getByText('site Median Views')).toBeTruthy();
    expect(screen.getByText('90')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Inspect' }));
    expect(await screen.findByTestId('path')).toHaveProperty('textContent', '/sanwater/admins/secure/subjects/product/abc?from=2026-09-01&to=2026-09-30');
  });

  it('keeps date filters in the URL and navigates from a product row to its subject', async () => {
    fetchDomain.mockResolvedValue({ kpis: {}, rows: [{ productId: '507f1f77bcf86cd799439011', product: 'Filter A', uniqueViews: 30, salesIntent: 4, qualifiedLeads: 2, orders: 1, orderConversionRate: 3.3, revenue: 1200, trend: { percentageChange: 20 }, classification: 'winner' }] });
    mount('/sanwater/admins/secure/analytics/products?from=2026-09-01&to=2026-09-30', '/sanwater/admins/secure/analytics/:domain', <><IntelligenceDomain /><Path /></>);
    expect(await screen.findByText('Filter A')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-09-01')).toBeTruthy();
    fireEvent.click(screen.getByText('Filter A'));
    expect(await screen.findByTestId('path')).toHaveProperty('textContent', '/sanwater/admins/secure/subjects/product/507f1f77bcf86cd799439011?from=2026-09-01&to=2026-09-30');
  });

  it('shows subject activity and an unavailable state when data is missing', async () => {
    fetchSubject.mockResolvedValue({ performance: null, events: [], activity: [{ _id: '1', userId: { fullName: 'Sarah' }, createdAt: '2026-10-02T11:42:00Z', details: { summary: 'Changed price', changes: [{ field: 'prices.productPrice', label: 'Price', before: 1500, after: 1750 }] } }] });
    mount('/sanwater/admins/secure/subjects/product/507f1f77bcf86cd799439011', '/sanwater/admins/secure/subjects/:type/:id', <SubjectIntelligence />);
    expect(await screen.findByText(/Sarah · Changed price/)).toBeTruthy();
    expect(screen.getByText(/1500 → 1750/)).toBeTruthy();
    expect(screen.getByText('Performance metrics are unavailable for this subject type.')).toBeTruthy();
  });

  it('shows product trend, observed stages, and first-party acquisition segments', async () => {
    fetchSubject.mockResolvedValue({ performance: { product: 'Filter A', uniqueViews: 30, salesIntent: 8, qualifiedLeads: 3, orders: 1, revenue: 1200, viewTrend: { percentageChange: 20 }, trend: { percentageChange: 10 }, classification: 'winner' }, funnel: [{ name: 'Product viewers', count: 30 }, { name: 'Inquiry starts', count: 8 }], acquisition: [{ channel: 'Paid Search', source: 'google', campaign: 'spring', landingPage: '/products', device: 'mobile', visitors: 12 }], events: [], activity: [] });
    mount('/sanwater/admins/secure/subjects/product/507f1f77bcf86cd799439011', '/sanwater/admins/secure/subjects/:type/:id', <SubjectIntelligence />);
    expect(await screen.findByText('Filter A')).toBeTruthy();
    expect(screen.getByText('Observed stages')).toBeTruthy();
    expect(screen.getByText('Paid Search')).toBeTruthy();
    expect(screen.getByText('+10.0% vs previous period')).toBeTruthy();
  });

  it('renders unavailable metrics and retry after an error', async () => {
    fetchDashboard.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ persona: 'general_admin', visibleDomains: [], sections: {}, attention: [] });
    mount('/sanwater/admins/secure', '/sanwater/admins/secure', <Analytics />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('No analytics domains are assigned to this account.')).toBeTruthy();
    render(<MetricCard name="revenue" metric={{ available: false, reason: 'Missing final values' }} />);
    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.getByText('Missing final values')).toBeTruthy();
    render(<MetricCard name="viewToApplyClick" metric={null} />);
    expect(screen.getAllByText('Unavailable')).toHaveLength(2);
  });

  it('renders intelligence copy in Arabic and retains RTL direction', () => {
    localStorage.setItem('lang', 'ar');
    render(<I18nProvider><MemoryRouter><MetricCard name="revenue" metric={{ current: 120 }} /></MemoryRouter></I18nProvider>);
    expect(screen.getByText('الإيرادات (دج)')).toBeTruthy();
    expect(document.documentElement.dir).toBe('rtl');
  });
});
