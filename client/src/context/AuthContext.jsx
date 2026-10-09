import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gecwc_token') || null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on mount or token change
  useEffect(() => {
    let retryTimeout;
    async function loadUser(retryCount = 0) {
      if (!token) {
        setUser(null);
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setStats(data.stats);
          setLoading(false);
        } else if (res.status === 401 || res.status === 403) {
          // Token is genuinely invalid, expired, or account suspended
          logout();
          setLoading(false);
        } else {
          // Server cold start (502/503/504) or waking up:
          // NEVER logout! Keep token and retry up to 3 times after 3 seconds
          if (retryCount < 3) {
            retryTimeout = setTimeout(() => {
              loadUser(retryCount + 1);
            }, 3000);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.warn('Network glitch or server waking up, retaining login session:', err);
        if (retryCount < 3) {
          retryTimeout = setTimeout(() => {
            loadUser(retryCount + 1);
          }, 3000);
        } else {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('gecwc_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('gecwc_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gecwc_token');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        stats,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isModerator: user?.role === 'moderator' || user?.role === 'admin',
        isStudent: user?.role === 'student'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
