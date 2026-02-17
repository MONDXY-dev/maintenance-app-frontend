import { useState, useEffect, useRef, useCallback } from 'react';
import liff from '@line/liff';

const useLiff = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const isInitialized = useRef(false);

  // Check if running in development mode
  const isDev = import.meta.env.DEV || import.meta.env.VITE_DEV_BYPASS === 'true';

  // ตรวจสอบว่าอยู่ในโหมด Mock หรือไม่ (ปิดได้ผ่าน VITE_USE_MOCK=false)
  const useMockProfile = import.meta.env.VITE_USE_MOCK === 'true';

  const initializeLiff = useCallback(async () => {
    try {
      // ถ้าเปิดโหมด Mock ให้ใช้ mock profile (ต้องตั้ง VITE_USE_MOCK=true ใน .env)
      if (useMockProfile) {
        console.log('🔧 Mock Mode: Using mock profile');
        setProfile({
          userId: 1,
          displayName: 'Dev User',
          pictureUrl: 'https://via.placeholder.com/150/3b82f6/ffffff?text=DEV',
          email: 'dev@example.com',
          role: 'admin'
        });
        setLineUserId('dev-user-id');
        setIsLoggedIn(true);
        setIsLoading(false);
        return;
      }

      // DEV BYPASS: Check for existing dev-token in localStorage
      const currentToken = localStorage.getItem('token');
      if (currentToken?.startsWith('dev-token-') && isDev) {
        const storedRole = currentToken.replace('dev-token-', '');
        console.log(`🔧 Restoring dev login session (${storedRole}) - syncing with backend`);
        setLineUserId(`dev-user-${storedRole}`);
      }

      const liffId = import.meta.env.VITE_LIFF_ID;
      
      if (!liffId) {
        throw new Error('LIFF ID ไม่ได้ถูกตั้งค่า กรุณาตรวจสอบไฟล์ .env');
      }

      await liff.init({ liffId });

      if (liff.isLoggedIn() || (currentToken?.startsWith('dev-token-') && isDev)) {
        // ลบ authorization code จาก URL เพื่อป้องกัน error เมื่อ reload
        const url = new URL(window.location.href);
        if (url.searchParams.has('code') || url.searchParams.has('state') || url.searchParams.has('liffClientId')) {
          url.search = '';
          window.history.replaceState({}, document.title, url.toString());
        }

        try {
          let userProfile;
          let accessToken;

          const activeToken = localStorage.getItem('token');
          if (activeToken?.startsWith('dev-token-') && isDev) {
            const devRole = activeToken.replace('dev-token-', '');
            userProfile = {
              userId: `dev-user-${devRole}`,
              displayName: `Dev ${devRole.charAt(0).toUpperCase() + devRole.slice(1)}`
            };
            accessToken = activeToken;
          } else {
            userProfile = await liff.getProfile();
            accessToken = liff.getAccessToken();
          }
          
          setLineUserId(userProfile.userId);

          if (accessToken) {
            localStorage.setItem('token', accessToken);
          }
          
          if (!accessToken) {
            console.warn('No access token, re-logging in...');
            liff.logout();
            window.location.reload();
            return;
          }
          
          // ตรวจสอบกับ Backend
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
              setProfile({
                ...userProfile,
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role,
                status: data.user.status
              });
              setIsLoggedIn(true);
            } else {
              if (response.status === 401 && data.message && 
                  (data.message.includes('not found') || 
                   data.message.includes('not authorized') ||
                   data.message.includes('Unauthorized'))) {
                throw new Error(data.message || 'User not authorized');
              }
              
              if (response.status === 401 && data.message && data.message.includes('invalid')) {
                console.warn('Token invalid, logging out...');
                liff.logout();
                localStorage.removeItem('token');
                window.location.reload();
                return;
              }
              
              throw new Error(data.message || 'User not authorized');
            }
          } catch (fetchError) {
            if (fetchError.message.includes('Failed to fetch') || fetchError.name === 'TypeError') {
              throw new Error('ไม่สามารถเชื่อมต่อกับ Backend API\n\n1. ตรวจสอบว่า Backend Server ทำงานที่ ' + import.meta.env.VITE_API_URL + '\n2. ปิด Ad Blocker หรือ Browser Extension ที่อาจ block request\n3. ตรวจสอบ CORS settings');
            }
            throw fetchError;
          }
        } catch (profileError) {
          if (profileError.message && profileError.message.includes('scope')) {
            throw new Error('LIFF app ไม่มี permission ที่จำเป็น\n\nกรุณาไปที่ LINE Developers Console:\n1. เปิด LIFF app settings\n2. เพิ่ม Scopes: profile, openid\n3. Save และลองใหม่อีกครั้ง');
          }
          throw profileError;
        }
      } else {
        // Only auto-login in production to allow Dev Login buttons in dev mode
        if (!isDev) {
          liff.login();
        } else {
          console.log('🔧 Dev Mode: Auto-login disabled. Use Dev Login buttons or Line Login (Real).');
        }
      }
    } catch (err) {
      console.error('LIFF initialization failed', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [useMockProfile, isDev]);

  useEffect(() => {
    // ป้องกันการ init ซ้ำจาก React Strict Mode
    if (isInitialized.current) return;
    isInitialized.current = true;
    initializeLiff();
  }, [initializeLiff]);

  const logout = useCallback(() => {
    // Handle dev mode logout
    if (localStorage.getItem('dev_logged_in')) {
      localStorage.removeItem('dev_logged_in');
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setProfile(null);
      window.location.reload();
      return;
    }
    if (liff.isLoggedIn()) {
      liff.logout();
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setProfile(null);
      window.location.reload();
    }
  }, []);

  // Dev login function for bypassing LIFF in development
  const devLogin = useCallback((role = 'admin') => {
    console.log(`🔧 Dev login activated - role: ${role}`);
    localStorage.setItem('dev_logged_in', 'true');
    localStorage.setItem('token', `dev-token-${role}`);
    window.location.reload();
  }, []);

  return {
    isLoggedIn,
    isLoading,
    profile,
    error,
    lineUserId,
    logout,
    liff,
    devLogin,
    isDev,
  };
};

export default useLiff;
