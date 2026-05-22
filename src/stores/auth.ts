import { create } from 'zustand';
import { getUser, loginUser, logoutUser, registerUser, uploadUserImage } from '../api/users';
import { ApiError } from '../api/client';

const storageKey = 's365-auth';

export type AuthSession = {
  token: string;
  userId: number;
};

export type UserProfile = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type AuthState = {
  auth: AuthSession | null;
  profile: UserProfile | null;
  currentUser: (AuthSession & UserProfile) | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (data: RegisterData, profileImage?: File | null) => Promise<AuthSession>;
  refreshProfile: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
};

function readStoredAuth(): AuthSession | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(value: AuthSession | null) {
  if (!value) {
    localStorage.removeItem(storageKey);
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function toDerivedState(auth: AuthSession | null, profile: UserProfile | null) {
  return {
    currentUser: auth ? { ...auth, ...profile } : null,
    isAuthenticated: Boolean(auth?.token),
  };
}

const storedAuth = readStoredAuth();

export const useAuth = create<AuthState>((set, get) => ({
  auth: storedAuth,
  profile: null,
  ...toDerivedState(storedAuth, null),

  login: async (email, password) => {
    const nextAuth = await loginUser({ email, password });
    writeStoredAuth(nextAuth);
    set({ auth: nextAuth, profile: null, ...toDerivedState(nextAuth, null) });
    await get().refreshProfile();
    return nextAuth;
  },

  register: async (data, profileImage) => {
    await registerUser(data);
    const nextAuth = await loginUser({ email: data.email, password: data.password });
    writeStoredAuth(nextAuth);
    set({ auth: nextAuth, profile: null, ...toDerivedState(nextAuth, null) });

    if (profileImage) {
      await uploadUserImage(nextAuth.userId, profileImage, nextAuth.token);
    }

    await get().refreshProfile();
    return nextAuth;
  },

  refreshProfile: async () => {
    const { auth } = get();
    if (!auth?.userId || !auth?.token) {
      set({ profile: null, ...toDerivedState(auth, null) });
      return null;
    }

    try {
      const nextProfile = await getUser(auth.userId, auth.token);
      set({ profile: nextProfile, ...toDerivedState(auth, nextProfile) });
      return nextProfile;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        writeStoredAuth(null);
        set({ auth: null, profile: null, ...toDerivedState(null, null) });
        return null;
      }
      throw err;
    }
  },

  logout: async () => {
    const { auth } = get();
    try {
      if (auth?.token) {
        await logoutUser(auth.token);
      }
    } finally {
      writeStoredAuth(null);
      set({ auth: null, profile: null, ...toDerivedState(null, null) });
    }
  },
}));

if (storedAuth?.token) {
  void useAuth.getState().refreshProfile().catch(() => {
    writeStoredAuth(null);
    useAuth.setState({ auth: null, profile: null, ...toDerivedState(null, null) });
  });
}
