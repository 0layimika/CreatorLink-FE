export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.linkverse.live/api/v1';

interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: {
        code: string;
        message: string;
    } | string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private handleUnauthorized(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('creator');
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'expired' } }));
    }

    private getAuthHeader(): Record<string, string> {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
            ...(options.headers as Record<string, string> || {}),
        };

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                this.handleUnauthorized();
            }

            let data;
            try {
                data = await response.json();
            } catch {
                // Response is not JSON
                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return { success: true } as ApiResponse<T>;
            }

            if (!response.ok || data.success === false) {
                // Extract error message from backend response structure
                // Backend format: { success: false, error: { code: "...", message: "..." } }
                let errorMessage = 'An error occurred';

                if (data.error) {
                    if (typeof data.error === 'object' && data.error.message) {
                        errorMessage = data.error.message;
                    } else if (typeof data.error === 'string') {
                        errorMessage = data.error;
                    }
                } else if (data.message) {
                    errorMessage = data.message;
                }

                if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }

                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                // Check for network errors
                if (error.message === 'Failed to fetch') {
                    throw new Error('Unable to connect to server. Please check your internet connection.');
                }
                throw error;
            }
            throw new Error('An unexpected error occurred');
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
        });
    }

    async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }

    async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API - matches backend structure
export const authApi = {
    register: (data: { email: string; password: string; confirmPassword: string }) =>
        api.post<{ user: unknown; verificationLink: string }>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ creator: unknown; token: string }>('/auth/login', data),

    verify: (token: string) =>
        api.patch<{ user: unknown; token: string }>(`/auth/verify?token=${token}`),

    resendVerification: (email: string) =>
        api.post<{ message: string }>('/auth/resend-verification', { email }),

    forgotPassword: (email: string) =>
        api.post<{ message: string }>('/auth/forgot-password', { email }),

    resendForgotPassword: (email: string) =>
        api.post<{ message: string }>('/auth/resend-forgot-password', { email }),

    resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
        api.put<{ message: string }>(`/auth/reset-password?token=${token}`, { newPassword, confirmPassword }),
};

// Creator API - matches backend field names (first_name, last_name snake_case)
export const creatorApi = {
    create: (data: { username: string; first_name: string; last_name: string; bio?: string; avatar_url?: string }) =>
        api.post('/creator/new', data),

    update: (data: { username?: string; first_name?: string; last_name?: string; bio?: string; avatar_url?: string }) =>
        api.patch('/creator/update', data),
};

// Links API
export const linksApi = {
    getAll: () => api.get<Array<{
        id: number;
        title: string;
        url: string;
        icon: string | null;
        clicks: number;
        is_active: boolean;
        position: number;
    }>>('/links'),

    create: (data: { title: string; url: string; icon?: string; thumbnail_url?: string | null }) =>
        api.post('/links', data),

    update: (id: number, data: { title?: string; url?: string; icon?: string; thumbnail_url?: string | null; position?: number }) =>
        api.patch(`/links/${id}`, data),

    delete: (id: number) =>
        api.delete(`/links/${id}`),

    activate: (id: number) =>
        api.patch(`/links/${id}/activate`),

    deactivate: (id: number) =>
        api.patch(`/links/${id}/deactivate`),

    reorder: (linkIds: number[]) =>
        api.post('/links/reorder', { linkIds }),
};

// Analytics API
export const analyticsApi = {
    getOverview: (params?: { startDate?: string; endDate?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        const query = queryParams.toString();
        return api.get<{
            totalViews: number;
            totalClicks: number;
            viewsChange: number;
            clicksChange: number;
            dailyStats: Array<{ date: string; views: number; clicks: number }>;
            topLinks: Array<{ id: string; title: string; clicks: number }>;
        }>(`/analytics/overview${query ? `?${query}` : ''}`);
    },

    getLinkAnalytics: (linkId: string, params?: { startDate?: string; endDate?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        const query = queryParams.toString();
        return api.get(`/analytics/links/${linkId}${query ? `?${query}` : ''}`);
    },

    trackProfileView: (username: string, referrer?: string) =>
        api.post(`/analytics/track/profile/${username}`, { referrer }),

    trackLinkClick: (linkId: string, referrer?: string) =>
        api.post(`/analytics/track/link/${linkId}`, { referrer }),
};

// Wallet API
export const walletApi = {
    getWallet: () => api.get<{
        id: string;
        balance: number;
        pending_balance: number;
        currency: string;
    }>('/wallet'),

    getBalance: () => api.get<{ balance: number; pending: number; currency: string }>('/wallet/balance'),

    getTransactions: (params?: { page?: number; limit?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const query = queryParams.toString();
        return api.get<Array<{
            id: number;
            type: string;
            amount: string | number;
            currency: string;
            description: string | null;
            status: string;
            reference: string;
            sender_name: string | null;
            sender_email: string | null;
            created_at: string;
        }>>(`/wallet/transactions${query ? `?${query}` : ''}`);
    },

    getBanks: () => api.get<Array<{ code: string; name: string }>>('/wallet/banks'),

    resolveAccount: (accountNumber: string, bankCode: string) =>
        api.get(`/wallet/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`),

    setBankAccount: (data: { account_number: string; bank_code: string; account_name: string }) =>
        api.post('/wallet/bank-account', data),

    getBankAccount: () => api.get<{
        id: number;
        account_number: string;
        account_name: string;
        bank_code: string;
        bank_name: string;
        recipient_code: string | null;
        provider: string | null;
    }>('/wallet/bank-account'),

    withdraw: (amount: number) =>
        api.post('/wallet/withdraw', { amount }),

    getWithdrawals: () => api.get('/wallet/withdrawals'),
};

// Profile API (public)
export const profileApi = {
    getPublicProfile: (username: string) =>
        api.get<{
            id: string;
            username: string;
            first_name: string;
            last_name: string;
            bio: string;
            avatar_url: string;
            profile_config: {
                background_type: string;
                background_value: string | null;
                text_color: string | null;
                support_button_text?: string | null;
            } | null;
            links: Array<{
                id: string;
                title: string;
                url: string;
                icon: string;
                thumbnail_url?: string | null;
            }>;
        }>(`/profile/${username}`),

    getProfileConfig: () => api.get<{
        background_type: string;
        background_value: string | null;
        text_color: string | null;
        support_button_text?: string | null;
    }>('/profile/config'),

    updateProfileConfig: (data: {
        background_type?: 'color' | 'image';
        background_value?: string | null;
        text_color?: string | null;
        support_button_text?: string | null;
    }) => api.patch('/profile/config', data),
};

// Media API
export const mediaApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<{ url: string; fileId: string }>('/media/upload', formData);
    },

    delete: (fileId: string) =>
        api.delete(`/media/delete/${fileId}`),
};

// Gift API
export const giftApi = {
    sendGift: (data: {
        creatorUsername: string;
        amount: number;
        sender_email: string;
        sender_name?: string;
        description?: string;
    }) =>
        api.post<{
            authorization_url: string;
            reference: string;
            transaction_id: number;
        }>(`/gift/${data.creatorUsername}`, {
            amount: data.amount,
            sender_email: data.sender_email,
            sender_name: data.sender_name,
            description: data.description,
        }),

    verifyGift: (reference: string) =>
        api.get<{
            status: 'completed' | 'pending' | 'failed';
        }>(`/gift/verify?reference=${reference}`),
};

// Store API
export const storeApi = {
    createProduct: (data: {
        type: 'digital' | 'physical' | 'service';
        title: string;
        description?: string | null;
        price: number;
        currency?: string;
        cover_url?: string | null;
        is_active?: boolean;
        download_limit?: number;
        file_id?: string | null;
        file_url?: string | null;
        file_size?: number | null;
        file_type?: string | null;
        duration_minutes?: number | null;
        buffer_minutes?: number | null;
        timezone?: string | null;
        requires_address?: boolean;
    }) => api.post('/store/products', data),

    updateProduct: (id: number, data: Partial<{
        title: string;
        description?: string | null;
        price: number;
        currency?: string;
        cover_url?: string | null;
        is_active?: boolean;
        download_limit?: number;
        file_id?: string | null;
        file_url?: string | null;
        file_size?: number | null;
        file_type?: string | null;
        duration_minutes?: number | null;
        buffer_minutes?: number | null;
        timezone?: string | null;
        requires_address?: boolean;
    }>) => api.patch(`/store/products/${id}`, data),

    listMyProducts: (params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get(`/store/products${query ? `?${query}` : ''}`);
    },

    listOrders: (params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get(`/store/orders${query ? `?${query}` : ''}`);
    },
    resendOrderEmail: (orderId: number) => api.post(`/store/orders/${orderId}/resend-email`),

    listBookings: (params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get(`/store/bookings${query ? `?${query}` : ''}`);
    },

    getStorefront: (username: string, params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get(`/store/${username}${query ? `?${query}` : ''}`);
    },

    initiatePurchase: (username: string, productId: number, data: {
        buyer_email: string;
        buyer_name?: string;
        buyer_phone?: string;
        delivery_address?: Record<string, any> | null;
        slot_start?: string;
        slot_end?: string;
    }) => api.post(`/store/${username}/buy/${productId}`, data),

    verifyPurchase: (reference: string) =>
        api.get(`/store/verify?reference=${reference}`),

    getOrder: (reference: string) =>
        api.get(`/store/order?reference=${reference}`),

    download: (token: string) => api.get(`/store/download/${token}`),

    listServiceSlots: (username: string, serviceId: number, params: { from: string; to: string }) =>
        api.get(`/store/${username}/services/${serviceId}/slots?from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`),

    holdServiceSlot: (username: string, serviceId: number, data: {
        slot_start: string;
        slot_end: string;
        buyer_email?: string;
        buyer_name?: string;
        buyer_phone?: string;
        notes?: string;
    }) => api.post(`/store/${username}/services/${serviceId}/hold`, data),

    listAvailability: () => api.get('/store/availability'),

    createAvailability: (data: { weekday: number; start_time: string; end_time: string; timezone: string }) =>
        api.post('/store/availability', data),
};
