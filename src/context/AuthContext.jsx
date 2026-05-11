/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getUser, loginUser, logoutUser, registerUser, uploadUserImage } from '../api/users.js';

const storageKey = 's365-auth';
const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(value) {
  if (!value) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    writeStoredAuth(auth);
  }, [auth]);

  useEffect(() => {
    let active = true;

    if (!auth?.userId || !auth?.token) {
      setProfile(null);
      return undefined;
    }

    getUser(auth.userId, auth.token)
      .then((user) => {
        if (active) setProfile(user);
      })
      .catch(() => {
        if (active) setProfile(null);
      });

    return () => {
      active = false;
    };
  }, [auth]);

  const login = useCallback(async (email, password) => {
    const nextAuth = await loginUser({ email, password });
    setAuth(nextAuth);
    return nextAuth;
  }, []);

  const register = useCallback(async (data, profileImage) => {
    await registerUser(data);
    const nextAuth = await loginUser({ email: data.email, password: data.password });
    setAuth(nextAuth);

    if (profileImage) {
      await uploadUserImage(nextAuth.userId, profileImage, nextAuth.token);
    }

    return nextAuth;
  }, []);

  const logout = useCallback(async () => {
    if (auth?.token) {
      await logoutUser(auth.token);
    }
    setAuth(null);
  }, [auth?.token]);

  const value = useMemo(
    () => ({
      auth,
      currentUser: auth ? { ...auth, ...profile } : null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
    }),
    [auth, login, logout, profile, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
