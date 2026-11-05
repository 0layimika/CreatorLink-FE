import { api } from './api';
import type { AdminAudit, AdminOperation, AdminOverview, AdminPage, AdminQuery, AdminRelease, AdminTransaction, AdminUser } from '@/types/admin';

const queryString = (query: AdminQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  return params.toString();
};
export const adminApi = {
  session: () => api.get<{ user_id: number }>('/admin/session'),
  overview: () => api.get<AdminOverview>('/admin/overview'),
  users: (query: AdminQuery, signal?: AbortSignal) => api.get<AdminPage<AdminUser>>(`/admin/users?${queryString(query)}`, { signal }),
  transactions: (query: AdminQuery, signal?: AbortSignal) => api.get<AdminPage<AdminTransaction>>(`/admin/transactions?${queryString(query)}`, { signal }),
  releases: (query: AdminQuery, signal?: AbortSignal) => api.get<AdminPage<AdminRelease>>(`/admin/pending-releases?${queryString(query)}`, { signal }),
  audit: (query: AdminQuery, signal?: AbortSignal) => api.get<AdminPage<AdminAudit>>(`/admin/audit?${queryString(query)}`, { signal }),
  block: (userId: number, body: AdminOperation & { blocked: boolean }) => api.patch(`/admin/users/${userId}/block`, body),
  debit: (walletId: number, body: AdminOperation & { amount: string }) => api.post<{ reference: string }>(`/admin/wallets/${walletId}/debit`, body),
  release: (releaseId: string, body: AdminOperation) => api.post<{ already_released: boolean }>(`/admin/pending-releases/${encodeURIComponent(releaseId)}/release`, body),
};
