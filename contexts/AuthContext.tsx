'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, creatorApi } from '@/lib/api';

interface Creator {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar_url?: string;
    user_id: number;
}

interface User {
    id: number;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatar?: string;
    verified: boolean;
}

interface AuthContextType {
    user: User | null;
    creator: Creator | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<{ verificationLink: string }>;
    verify: (token: string) => Promise<void>;
    createCreator: (data: CreatorData) => Promise<void>;
    updateCreator: (data: Partial<CreatorData>) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

interface RegisterData {
    email: string;
    password: string;
    confirmPassword: string;
}

interface CreatorData {
    username: string;
    first_name: string;
    last_name: string;
    bio?: string;
    avatar_url?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [creator, setCreator] = useState<Creator | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check if user is authenticated on mount
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');
        const storedCreator = localStorage.getItem('creator');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                if (storedCreator) {
                    setCreator(JSON.parse(storedCreator));
                }
            } catch {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                localStorage.removeItem('creator');
            }
        }
        setIsLoading(false);
    }, []);

    // Listen for global auth expiration/logout events
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setCreator(null);
            router.push('/login');
        };

        window.addEventListener('auth:logout', handleLogout as EventListener);
        return () => {
            window.removeEventListener('auth:logout', handleLogout as EventListener);
        };
    }, [router]);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login({ email, password });

            if (response.success && response.data) {
                const { token, creator: creatorData } = response.data as { token: string; creator: Creator };
                localStorage.setItem('auth_token', token);
                localStorage.setItem('creator', JSON.stringify(creatorData));

                // Map creator to user format for compatibility
                const userData: User = {
                    id: creatorData.user_id,
                    email: email,
                    username: creatorData.username,
                    firstName: creatorData.first_name,
                    lastName: creatorData.last_name,
                    bio: creatorData.bio,
                    avatar: creatorData.avatar_url,
                    verified: true,
                };
                localStorage.setItem('user', JSON.stringify(userData));

                setUser(userData);
                setCreator(creatorData);
                router.push('/dashboard');
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const register = useCallback(async (data: RegisterData): Promise<{ verificationLink: string }> => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);

            if (response.success && response.data) {
                const { user: userData, verificationLink } = response.data as { user: any; verificationLink: string };
                // Store user temporarily (not verified yet)
                setUser({
                    id: userData.id,
                    email: userData.email,
                    verified: false,
                });
                return { verificationLink };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verify = useCallback(async (token: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.verify(token);

            if (response.success && response.data) {
                const { user: userData, token: accessToken } = response.data as { user: any; token: string };
                localStorage.setItem('auth_token', accessToken);
                localStorage.setItem('user', JSON.stringify({
                    id: userData.id,
                    email: userData.email,
                    verified: true,
                }));
                setUser({
                    id: userData.id,
                    email: userData.email,
                    verified: true,
                });
                // After verification, redirect to creator setup
                router.push('/setup-creator');
            } else {
                throw new Error(response.message || 'Verification failed');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const createCreator = useCallback(async (data: CreatorData) => {
        setIsLoading(true);
        try {
            const response = await creatorApi.create(data);

            if (response.success && response.data) {
                const creatorData = response.data as Creator;
                localStorage.setItem('creator', JSON.stringify(creatorData));

                // Update user with creator info
                const updatedUser: User = {
                    id: creatorData.user_id,
                    email: user?.email || '',
                    username: creatorData.username,
                    firstName: creatorData.first_name,
                    lastName: creatorData.last_name,
                    bio: creatorData.bio,
                    avatar: creatorData.avatar_url,
                    verified: true,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setCreator(creatorData);
                setUser(updatedUser);
                router.push('/dashboard');
            } else {
                throw new Error(response.message || 'Failed to create creator profile');
            }
        } finally {
            setIsLoading(false);
        }
    }, [user, router]);

    const updateCreator = useCallback(async (data: Partial<CreatorData>) => {
        setIsLoading(true);
        try {
            const response = await creatorApi.update(data);

            if (response.success && response.data) {
                const updatedCreator = response.data as Creator;
                localStorage.setItem('creator', JSON.stringify(updatedCreator));

                // Update user with new creator info
                const updatedUser: User = {
                    id: updatedCreator.user_id,
                    email: user?.email || '',
                    username: updatedCreator.username,
                    firstName: updatedCreator.first_name,
                    lastName: updatedCreator.last_name,
                    bio: updatedCreator.bio,
                    avatar: updatedCreator.avatar_url,
                    verified: true,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setCreator(updatedCreator);
                setUser(updatedUser);
            } else {
                throw new Error('Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('creator');
        setUser(null);
        setCreator(null);
        router.push('/login');
    }, [router]);

    const updateUser = useCallback((data: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...data };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                creator,
                isLoading,
                isAuthenticated: !!user && !!creator,
                login,
                register,
                verify,
                createCreator,
                updateCreator,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
