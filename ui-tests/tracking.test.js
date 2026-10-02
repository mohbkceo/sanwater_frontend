import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackCustomEvent } from '../src/services/analytics/analytics';

afterEach(() => { vi.unstubAllGlobals(); });

describe('public analytics tracking', () => {
  it('ties an article product click to the article and retains only the related product ID', () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);
    trackCustomEvent('article_product_clicked', { article_id: '507f1f77bcf86cd799439011', product_id: '507f1f77bcf86cd799439012', page: '/news/story' });
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.subject).toEqual({ type: 'article', id: '507f1f77bcf86cd799439011' });
    expect(payload.relatedProductId).toBe('507f1f77bcf86cd799439012');
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });
});
