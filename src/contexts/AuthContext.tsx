import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { SSOAuthService, SSOUserData } from '../services/authService';

interface User {
  email: string;
  name?: string;
  uid?: string;
  yearOfStudy?: string;
  role?: string;
  isAdmin?: boolean;
  authType?: 'firebase' | 'sso';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isSSOAuthenticated: boolean;
  ssoUser: SSOUserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ssoUser, setSsoUser] = useState<SSOUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for SSO authentication on mount
  useEffect(() => {
    const checkSSOAuth = () => {
      try {
        // Check if there's a token in URL parameters
        const hasSSOToken = SSOAuthService.checkForSSOToken();
        
        if (hasSSOToken) {
          const ssoUserData = SSOAuthService.validateTokenFromShell();
          if (ssoUserData) {
            setSsoUser(ssoUserData);
            setUser({
              email: ssoUserData.email,
              name: ssoUserData.name,
              uid: ssoUserData.uid,
              yearOfStudy: ssoUserData.yearOfStudy,
              role: ssoUserData.role,
              isAdmin: ssoUserData.isAdmin,
              authType: 'sso'
            });
            setIsLoading(false);
            return;
          }
        }

        // Check for existing SSO user data
        const storedSSOUser = SSOAuthService.getSSOUserData();
        if (storedSSOUser) {
          setSsoUser(storedSSOUser);
          setUser({
            email: storedSSOUser.email,
            name: storedSSOUser.name,
            uid: storedSSOUser.uid,
            yearOfStudy: storedSSOUser.yearOfStudy,
            role: storedSSOUser.role,
            isAdmin: storedSSOUser.isAdmin,
            authType: 'sso'
          });
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking SSO authentication:', error);
      }
    };

    checkSSOAuth();
  }, []);

  // Listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      // Only process Firebase auth if not already authenticated via SSO
      if (!ssoUser && firebaseUser) {
        const userData: User = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          uid: firebaseUser.uid,
          authType: 'firebase'
        };
        setUser(userData);
      } else if (!ssoUser && !firebaseUser) {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [ssoUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'An error occurred during login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = error.message || 'Google sign-in failed';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // If user is authenticated via SSO, use SSO logout
      if (ssoUser) {
        SSOAuthService.logout();
        setSsoUser(null);
        setUser(null);
        return;
      }

      // Otherwise, use Firebase logout
      await signOut(auth);
      // Use window.location.replace to avoid 404 issues
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.replace('/');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
    isLoading,
    isSSOAuthenticated: !!ssoUser,
    ssoUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
