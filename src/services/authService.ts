export interface SSOUserData {
  uid: string;
  email: string;
  name: string;
  yearOfStudy: string;
  role: string;
  isAdmin: boolean;
  shellDomain?: string;
  microAppDomain?: string;
}

export interface SSOTokenData {
  uid: string;
  email: string;
  name: string;
  yearOfStudy: string;
  role: string;
  isAdmin: boolean;
  shellDomain: string;
  microAppDomain: string;
  iat: number;
  exp: number;
  firebaseToken?: string;
}

export class SSOAuthService {
  private static readonly SSO_USER_KEY = 'sso_user_data';
  private static readonly SHELL_DOMAIN = 'https://bcombuddy.netlify.app';

  static validateTokenFromShell(): SSOUserData | null {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const isSSO = urlParams.get('sso') === 'true';

    if (!token || !isSSO) {
      return null;
    }

    try {
      const tokenData: SSOTokenData = JSON.parse(decodeURIComponent(token));
      
      // Validate required fields
      if (!tokenData.uid || !tokenData.email) {
        console.error('SSO Token validation failed: Missing required fields');
        return null;
      }

      // Check token expiration
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        console.error('SSO Token validation failed: Token expired');
        return null;
      }

      // Validate micro app domain matches current domain
      const currentDomain = window.location.origin;
      if (tokenData.microAppDomain && tokenData.microAppDomain !== currentDomain) {
        console.warn('SSO Token validation warning: Domain mismatch', {
          expected: tokenData.microAppDomain,
          current: currentDomain
        });
      }

      const userData: SSOUserData = {
        uid: tokenData.uid,
        email: tokenData.email,
        name: tokenData.name,
        yearOfStudy: tokenData.yearOfStudy,
        role: tokenData.role,
        isAdmin: tokenData.isAdmin,
        shellDomain: tokenData.shellDomain,
        microAppDomain: tokenData.microAppDomain
      };

      // Store user data in localStorage
      localStorage.setItem(this.SSO_USER_KEY, JSON.stringify(userData));
      
      // Clean URL parameters
      this.cleanUrl();
      
      console.log('✅ SSO Login successful:', userData);
      return userData;
    } catch (error) {
      console.error('Error validating SSO token:', error);
      return null;
    }
  }

  static getSSOUserData(): SSOUserData | null {
    const userData = localStorage.getItem(this.SSO_USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing stored SSO user data:', error);
      localStorage.removeItem(this.SSO_USER_KEY);
      return null;
    }
  }

  static isSSOAuthenticated(): boolean {
    return this.getSSOUserData() !== null;
  }

  static logout(): void {
    const userData = this.getSSOUserData();
    const shellDomain = userData?.shellDomain || 
                       new URLSearchParams(window.location.search).get('shell') || 
                       this.SHELL_DOMAIN;
    
    // Clear SSO data
    localStorage.removeItem(this.SSO_USER_KEY);
    
    console.log('SSO Logout: Redirecting to shell domain:', shellDomain);
    window.location.href = shellDomain;
  }

  static clearSSOData(): void {
    localStorage.removeItem(this.SSO_USER_KEY);
  }

  private static cleanUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('sso');
    url.searchParams.delete('shell');
    window.history.replaceState({}, document.title, url.toString());
  }

  static checkForSSOToken(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') !== null && urlParams.get('sso') === 'true';
  }
}
