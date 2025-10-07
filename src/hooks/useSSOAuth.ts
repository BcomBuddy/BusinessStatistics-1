import { useState, useEffect } from 'react';
import { SSOAuthService, SSOUserData } from '../services/authService';

export interface SSOAuthState {
  user: SSOUserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  clearSSOData: () => void;
}

export const useSSOAuth = (): SSOAuthState => {
  const [user, setUser] = useState<SSOUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSSO = () => {
      try {
        // First check if there's a token in URL parameters
        const hasSSOToken = SSOAuthService.checkForSSOToken();
        
        if (hasSSOToken) {
          // Validate token from shell
          const userData = SSOAuthService.validateTokenFromShell();
          if (userData) {
            setUser(userData);
            setLoading(false);
            return;
          }
        }

        // Check for existing SSO user data in localStorage
        const storedUser = SSOAuthService.getSSOUserData();
        if (storedUser) {
          setUser(storedUser);
          console.log('✅ SSO User restored from storage:', storedUser);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing SSO authentication:', error);
        setLoading(false);
      }
    };

    initializeSSO();
  }, []);

  const logout = () => {
    SSOAuthService.logout();
    setUser(null);
  };

  const clearSSOData = () => {
    SSOAuthService.clearSSOData();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    clearSSOData
  };
};
