import type { SocialLink, StoreProduct } from '@/types';

const getDefaultApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalHost) {
            return 'http://localhost:8010/api/v1';
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        return 'http://localhost:8010/api/v1';
    }

    return 'https://linkverse.pxxl.click/api/v1';
};

export const API_BASE_URL = (
    typeof window === 'undefined' ? process.env.SERVER_API_URL : undefined
) || process.env.NEXT_PUBLIC_API_URL || getDefaultApiBaseUrl();

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly code?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

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
        const method = (options.method || 'GET').toUpperCase();
        const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
        const mutationId = `${method}:${endpoint}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
            ...(options.headers as Record<string, string> || {}),
        };

        // Remove Content-Type for FormData
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        if (typeof window !== 'undefined' && isMutation) {
            window.dispatchEvent(new CustomEvent('api:mutation:start', {
                detail: { id: mutationId, method, endpoint },
            }));
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

                const errorCode = typeof data.error === 'object' ? data.error?.code : undefined;
                if (response.status === 401) {
                    throw new ApiError('Your session has expired. Please log in again.', response.status, errorCode);
                }

                throw new ApiError(errorMessage, response.status, errorCode);
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
        } finally {
            if (typeof window !== 'undefined' && isMutation) {
                window.dispatchEvent(new CustomEvent('api:mutation:end', {
                    detail: { id: mutationId, method, endpoint },
                }));
            }
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
        api.post<{ user: unknown }>('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ creator: unknown | null; token: string; user?: unknown }>('/auth/login', data),

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
    create: (data: { username: string; first_name: string; last_name: string; display_name?: string | null; bio?: string; avatar_url?: string }) =>
        api.post('/creator/new', data),

    update: (data: { username?: string; first_name?: string; last_name?: string; display_name?: string | null; bio?: string; avatar_url?: string }) =>
        api.patch('/creator/update', data),
};

// Links API
export const linksApi = {
    getAll: () => api.get<Array<{
        id: number;
        title: string;
        url: string;
        icon: string | null;
        thumbnail_url?: string | null;
        display_type?: 'standard' | 'featured';
        description?: string | null;
        clicks: number;
        is_active: boolean;
        position: number;
    }>>('/links'),

    create: (data: { title: string; url: string; icon?: string; thumbnail_url?: string | null; display_type?: 'standard' | 'featured'; description?: string | null }) =>
        api.post('/links', data),

    update: (id: number, data: { title?: string; url?: string; icon?: string; thumbnail_url?: string | null; display_type?: 'standard' | 'featured'; description?: string | null; position?: number }) =>
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
    getOverview: (period: 'today' | 'this_week' | 'this_month' | 'all_time' = 'this_week') => {
        return api.get<unknown>(`/analytics/overview?period=${period}`);
    },

    getLinkAnalytics: (linkId: string, period: 'today' | 'this_week' | 'this_month' | 'all_time' = 'this_week') => {
        return api.get(`/analytics/links/${linkId}?period=${period}`);
    },

    trackProfileView: (username: string, attribution?: string) =>
        api.post(`/analytics/track/profile/${username}${attribution ? `?${attribution}` : ''}`, {}),

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

    getBalance: () => api.get<{ balance: number; pending: number; currency: string; wallets?: Array<{ id: number; balance: number; currency: string }> }>('/wallet/balance'),

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
        api.get<{ account_name: string }>(`/wallet/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`),

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

    withdraw: (amount: number, currency: 'NGN' | 'USD' = 'NGN', password: string) =>
        api.post('/wallet/withdraw', { amount, currency, password }),

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
            display_name?: string | null;
            bio: string;
            avatar_url: string;
            profile_config: {
                background_type: string;
                background_value: string | null;
                text_color: string | null;
                support_button_text?: string | null;
                accent_color?: string | null;
                card_style?: 'solid' | 'outline' | 'glass' | null;
                profile_alignment?: 'left' | 'center' | 'right' | null;
                avatar_shape?: 'circle' | 'rounded' | null;
                avatar_size?: 'small' | 'medium' | 'large' | null;
                support_button_style?: 'solid' | 'outline' | null;
                support_enabled?: boolean;
            } | null;
            social_links?: SocialLink[];
            links: Array<{
                id: string;
                title: string;
                url: string;
                icon: string;
                thumbnail_url?: string | null;
                display_type?: 'standard' | 'featured';
                description?: string | null;
            }>;
        }>(`/profile/${username}`),

    getSocialLinks: () => api.get<{ social_links: SocialLink[] }>('/profile/social-links'),

    updateSocialLinks: (socialLinks: SocialLink[]) =>
        api.put<{ social_links: SocialLink[] }>('/profile/social-links', { social_links: socialLinks }),

    getProfileConfig: () => api.get<{
        background_type: 'color' | 'image';
        background_value: string | null;
        text_color: string | null;
        support_button_text?: string | null;
        accent_color?: string | null;
        card_style?: 'solid' | 'outline' | 'glass' | null;
        profile_alignment?: 'left' | 'center' | 'right' | null;
        avatar_shape?: 'circle' | 'rounded' | null;
        avatar_size?: 'small' | 'medium' | 'large' | null;
        support_button_style?: 'solid' | 'outline' | null;
        support_enabled?: boolean;
    }>('/profile/config'),

    updateProfileConfig: (data: {
        background_type?: 'color' | 'image';
        background_value?: string | null;
        text_color?: string | null;
        support_button_text?: string | null;
        accent_color?: string | null;
        card_style?: 'solid' | 'outline' | 'glass' | null;
        profile_alignment?: 'left' | 'center' | 'right' | null;
        avatar_shape?: 'circle' | 'rounded' | null;
        avatar_size?: 'small' | 'medium' | 'large' | null;
        support_button_style?: 'solid' | 'outline' | null;
        support_enabled?: boolean;
    }) => api.patch<{
        background_type: 'color' | 'image';
        background_value: string | null;
        text_color: string | null;
        support_button_text?: string | null;
        accent_color?: string | null;
        card_style?: 'solid' | 'outline' | 'glass' | null;
        profile_alignment?: 'left' | 'center' | 'right' | null;
        avatar_shape?: 'circle' | 'rounded' | null;
        avatar_size?: 'small' | 'medium' | 'large' | null;
        support_button_style?: 'solid' | 'outline' | null;
        support_enabled?: boolean;
    }>('/profile/config', data),
};

// Media API
export const mediaApi = {
    upload: async (file: File, options?: { preserveQuality?: boolean }) => {
        const FILE_TOO_LARGE_MESSAGE = 'Image too large. Keep it below 10MB.';
        const normalizeUploadError = (message: string) => {
            const normalized = message.toLowerCase();
            const isTooLarge = normalized.includes('too large')
                || normalized.includes('file size')
                || normalized.includes('max file size')
                || normalized.includes('request entity too large')
                || normalized.includes('content too large')
                || normalized.includes('413');
            return isTooLarge ? FILE_TOO_LARGE_MESSAGE : message;
        };

        const prepareImage = async (source: File) => {
            if (!source.type.startsWith('image/') || ['image/gif', 'image/svg+xml', 'image/heic', 'image/heif'].includes(source.type)) return source;
            try {
                const bitmap = await createImageBitmap(source);
                const maxDimension = options?.preserveQuality ? 4096 : 2400;
                const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                canvas.height = Math.max(1, Math.round(bitmap.height * scale));
                canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                bitmap.close();
                const optimized = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', options?.preserveQuality ? 0.95 : 0.86));
                return optimized ? new File([optimized], `${source.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' }) : source;
            } catch {
                return source;
            }
        };
        const uploadFile = await prepareImage(file);

        const uploadViaApi = () => {
            const formData = new FormData();
            formData.append('file', uploadFile);
            return api.post<{ url: string; fileId: string; fileType?: string; size?: number }>('/media/upload', formData);
        };

        const lowerName = file.name.toLowerCase();
        const isHeicFamily = file.type === 'image/heic'
            || file.type === 'image/heif'
            || lowerName.endsWith('.heic')
            || lowerName.endsWith('.heif');
        const targetFormat = isHeicFamily ? 'jpg' : undefined;

        try {
            const signResponse = await api.post<{
                timestamp: number;
                signature: string;
                apiKey: string;
                cloudName: string;
                folder: string;
                format?: string;
            }>('/media/sign-upload', targetFormat ? { format: targetFormat } : {});

            if (!signResponse.success || !signResponse.data) {
                throw new Error(signResponse.message || 'Failed to initialize upload');
            }

            const { timestamp, signature, apiKey, cloudName, folder, format } = signResponse.data;

            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('api_key', apiKey);
            formData.append('timestamp', String(timestamp));
            formData.append('signature', signature);
            formData.append('folder', folder);
            if (format) {
                formData.append('format', format);
            }

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: 'POST',
                body: formData,
            });

            let uploadData: {
                secure_url?: string;
                public_id?: string;
                resource_type?: string;
                bytes?: number;
                error?: { message?: string };
            } | null = null;
            try {
                uploadData = await uploadResponse.json();
            } catch {
                throw new Error('Upload failed: invalid Cloudinary response');
            }

            if (!uploadResponse.ok) {
                throw new Error(normalizeUploadError(uploadData?.error?.message || 'Failed to upload file'));
            }

            if (!uploadData?.secure_url || !uploadData.public_id || !uploadData.resource_type) {
                throw new Error('Upload failed: Cloudinary returned incomplete file data');
            }

            return {
                success: true,
                data: {
                    url: uploadData.secure_url,
                    fileId: uploadData.public_id,
                    fileType: uploadData.resource_type,
                    size: uploadData.bytes as number,
                },
            } as ApiResponse<{ url: string; fileId: string; fileType?: string; size?: number }>;
        } catch (error) {
            const directUploadMessage = error instanceof Error ? error.message : 'Failed to upload file';
            if (normalizeUploadError(directUploadMessage) === FILE_TOO_LARGE_MESSAGE) {
                throw new Error(FILE_TOO_LARGE_MESSAGE);
            }

            try {
                return await uploadViaApi();
            } catch (fallbackError) {
                const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Failed to upload file';
                throw new Error(normalizeUploadError(fallbackMessage));
            }
        }
    },

    delete: (fileId: string) =>
        api.delete(`/media/delete/${fileId}`),
};

// Gift API
export const giftApi = {
    sendGift: (data: {
        creatorUsername: string;
        amount: number;
        currency?: 'NGN' | 'USD';
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
            currency: data.currency || 'NGN',
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
  getStoreCurrency: () => api.get<{ currency: 'NGN' | 'USD' }>('/store/settings/currency'),
  setStoreCurrency: (currency: 'NGN' | 'USD') => api.patch<{ currency: 'NGN' | 'USD' }>('/store/settings/currency', { currency }),
    createProduct: (data: {
        type: 'digital' | 'physical' | 'service';
        title: string;
        description?: string | null;
        price: number;
        compare_at_price?: number | null;
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
        track_inventory?: boolean;
        stock_quantity?: number | null;
    }) => api.post('/store/products', data),

    updateProduct: (id: number, data: Partial<{
        title: string;
        description?: string | null;
        price: number;
        compare_at_price?: number | null;
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
        track_inventory?: boolean;
        stock_quantity?: number | null;
    }>) => api.patch(`/store/products/${id}`, data),

    deleteProduct: (id: number) => api.delete(`/store/products/${id}`),

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
    updateOrderStatus: (orderId: number, status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded') =>
        api.patch(`/store/orders/${orderId}/status`, { status }),
    resendOrderEmail: (orderId: number) => api.post(`/store/orders/${orderId}/resend-email`),

    listBookings: (params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get(`/store/bookings${query ? `?${query}` : ''}`);
    },
    updateBookingStatus: (bookingId: number, status: 'confirmed' | 'cancelled' | 'expired') =>
        api.patch(`/store/bookings/${bookingId}/status`, { status }),

    getStorefront: (username: string, params?: { limit?: number; offset?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const query = queryParams.toString();
        return api.get<{
            creator: {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                display_name?: string | null;
                bio?: string;
                avatar_url?: string;
                profile_config?: {
                    background_type?: string;
                    background_value?: string | null;
                    text_color?: string | null;
                    accent_color?: string | null;
                    card_style?: 'solid' | 'outline' | 'glass' | null;
                } | null;
            };
            products: StoreProduct[];
        }>(`/store/${username}${query ? `?${query}` : ''}`);
    },

    initiatePurchase: (username: string, productId: number, data: {
        buyer_email: string;
        buyer_name: string;
        buyer_phone: string;
        delivery_address?: Record<string, unknown> | null;
        hold_booking_id?: number;
        hold_token?: string;
        slot_start?: string;
        slot_end?: string;
    }) => api.post(`/store/${username}/buy/${productId}`, data),

    checkoutCart: (username: string, data: {
        buyer_email: string;
        buyer_name: string;
        buyer_phone: string;
        delivery_address?: Record<string, unknown> | null;
        items: Array<{ product_id: number; quantity: number }>;
    }) => api.post(`/store/${username}/cart/checkout`, data),

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
    updateAvailability: (id: number, data: Partial<{ weekday: number; start_time: string; end_time: string; timezone: string }>) =>
        api.patch(`/store/availability/${id}`, data),
    deleteAvailability: (id: number) => api.delete(`/store/availability/${id}`),
    listOwnerServiceSlots: (serviceId: number, params: { from: string; to: string }) =>
        api.get(`/store/services/${serviceId}/slots?from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`),
    blockServiceSlot: (data: { service_id: number; slot_start: string; slot_end: string; notes?: string }) =>
        api.post('/store/services/block', data),
};
