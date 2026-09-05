import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  devOtpPreview: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  adminLogin: (secretKey: string, phone?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);

  // On mount: check if server cookie session is still valid
  const fetchCurrentUser = async () => {
    try {
      const data = await authApi.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      // Only log out if server explicitly says "unauthorized" (401)
      // Network errors, server down etc. → keep user logged in
      if (err?.response?.status === 401) {
        setUser(null);
      }
      // Otherwise: do nothing — user stays logged in
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setDevOtpPreview(null);
  };

  const requestOtp = async (phone: string) => {
    const res = await authApi.requestOtp(phone);
    if (res.devOtp) setDevOtpPreview(res.devOtp);
    return res;
  };

  const verifyOtp = async (phone: string, code: string) => {
    const res = await authApi.verifyOtp(phone, code);
    if (res.success && res.user) {
      // Cookie is set by server automatically — just update user state
      setUser(res.user);
      closeAuthModal();
    }
  };

  const adminLogin = async (secretKey: string, phone?: string) => {
    const res = await authApi.adminLogin(secretKey, phone);
    if (res.success && res.user) {
      // Cookie is set by server automatically
      setUser(res.user);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network error
    } finally {
      // Cookie is cleared by server on logout response
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        isAuthModalOpen,
        devOtpPreview,
        openAuthModal,
        closeAuthModal,
        requestOtp,
        verifyOtp,
        adminLogin,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
