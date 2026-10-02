import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationsPage from '../src/routes/sanwatergroup/dashboard/pages/ApplicationsPage';
import { contentAPI } from '../src/services/baseAPIs';

vi.mock('../src/services/baseAPIs', () => ({ contentAPI: { get: vi.fn(), patch: vi.fn() } }));
vi.mock('../src/hooks/usePermissions', () => ({ usePermissions: () => ({ can: () => true }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('application management', () => {
  it('opens the candidate, shows history and saves stage, assignee and note', async () => {
    const id = '507f1f77bcf86cd799439011';
    contentAPI.get.mockImplementation(async path => {
      if (path === '/applications') return { data: { data: { rows: [{ _id: id, candidate: { fullName: 'Ada Example' }, hiringId: { title: 'Engineer' }, stage: 'applied', createdAt: '2026-10-01T00:00:00Z' }], total: 1 } } };
      if (path === '/applications/assignees') return { data: { data: [{ _id: '507f1f77bcf86cd799439012', fullName: 'Hiring Manager' }] } };
      return { data: { data: { _id: id, candidate: { fullName: 'Ada Example', email: 'ada@example.com' }, hiringId: { title: 'Engineer' }, stage: 'applied', stageHistory: [{ stage: 'applied', changedAt: '2026-10-01T00:00:00Z' }], notes: [], createdAt: '2026-10-01T00:00:00Z' } } };
    });
    contentAPI.patch.mockResolvedValue({ data: { success: true } });
    render(<MemoryRouter><ApplicationsPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Inspect' }));
    expect(await screen.findByText('ada@example.com')).toBeTruthy();
    expect(screen.getByText(/applied ·/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Stage'), { target: { value: 'screening' } });
    fireEvent.change(screen.getByLabelText('Assignee'), { target: { value: '507f1f77bcf86cd799439012' } });
    fireEvent.change(screen.getByLabelText('Add note'), { target: { value: 'Call scheduled' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(contentAPI.patch).toHaveBeenCalledWith(`/applications/${id}`, { stage: 'screening', assignedTo: '507f1f77bcf86cd799439012', note: 'Call scheduled' }));
  });
});
