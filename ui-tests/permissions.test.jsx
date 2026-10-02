import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../src/components/dashboard/Sidebar';

vi.mock('../src/hooks/usePermissions', () => ({ usePermissions: () => ({ persona: 'product_manager', can: permission => permission === 'analytics.products.view' }) }));
vi.mock('../src/lib/i18n', () => ({ useTranslation: () => ({ lang: 'en', t: key => key }) }));
afterEach(cleanup);

describe('persona navigation', () => {
  it('shows authorized product intelligence without other domain or explorer links', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText('Product Analytics')).toBeTruthy();
    expect(screen.queryByText('Hiring Analytics')).toBeNull();
    expect(screen.queryByText('Explorer')).toBeNull();
  });
});
