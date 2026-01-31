"use client";

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/endpoints/auth";
import { RegisterDto, LoginDto, JwtPayload } from "@/types/api/auth";
import { UserResponse } from "@/types/api/user";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Load user from backend on mount
   */
  const loadUser = useCallback(async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      // Fetch current user from backend
      const response = await authApi.me();

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      // Clear invalid tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = async (data: LoginDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Set user state
        setUser(userData as unknown as UserResponse);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterDto): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Set user state
        setUser(userData as unknown as UserResponse);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout (optional, mostly for logging)
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear tokens and user state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);

      // Redirect to login
      router.push("/login");
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    await loadUser();
  };

  /**
   * Load user on mount
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
