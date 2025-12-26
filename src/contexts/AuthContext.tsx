// Auth Context - Global authentication state management
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Hotel, LoginRequest, SignupRequest } from '@/types/api';
import { authApi } from '@/api/auth';
import { tokenStorage } from '@/api/client';

interface AuthContextType {
  user: User | null;
  hotel: Hotel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  setHotel: (hotel: Hotel) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development (remove when backend is connected)
const MOCK_USER: User = {
  id: '1',
  email: 'owner@grandhotel.com',
  name: 'John Owner',
  role: 'OWNER',
  hotel_id: 'hotel_1',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_HOTEL: Hotel = {
  id: 'hotel_1',
  name: 'The Grand Hotel',
  slug: 'the-grand-hotel',
  description: 'A luxurious 5-star hotel in the heart of the city',
  star_rating: 5,
  address: {
    city: 'Mumbai',
    country: 'India',
  },
  contact: {
    email: 'info@grandhotel.com',
    phone: '+91 22 1234 5678',
  },
  settings: {
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    check_in_time: '14:00',
    check_out_time: '11:00',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (tokenStorage.hasTokens()) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser);
          // TODO: Fetch hotel data based on user.hotel_id
          setHotel(MOCK_HOTEL);
        } catch {
          // Token invalid or expired
          tokenStorage.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await authApi.login(credentials);
      // setUser(response.user);
      
      // Mock login for development
      console.log('Login attempt:', credentials.email);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setUser(MOCK_USER);
      setHotel(MOCK_HOTEL);
      
      // Store mock tokens
      tokenStorage.setTokens({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await authApi.signup(data);
      // setUser(response.user);
      
      // Mock signup for development
      console.log('Signup attempt:', data.email, data.hotel_name);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({ ...MOCK_USER, email: data.email, name: data.name });
      setHotel({ ...MOCK_HOTEL, name: data.hotel_name });
      
      tokenStorage.setTokens({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'Bearer',
        expires_in: 3600,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore errors, clear local state anyway
    } finally {
      setUser(null);
      setHotel(null);
      tokenStorage.clearTokens();
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        hotel,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setHotel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
