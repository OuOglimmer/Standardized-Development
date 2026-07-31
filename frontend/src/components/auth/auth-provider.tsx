"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredSession,
  isAdminEmail,
  onAuthSessionChange,
  signInWithPassword,
  signOutSession,
  type AuthSession,
} from "@/lib/api/supabase-auth";

interface AuthContextValue {
  session: AuthSession | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let isMounted = true;

    void getStoredSession()
      .then((storedSession) => {
        if (isMounted) {
          setSession(storedSession);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
        }
      });

    const unsubscribe = onAuthSessionChange((nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      isAdmin: isAdminEmail(session?.user.email),
      signIn: async (email: string, password: string) => {
        setSession(await signInWithPassword(email, password));
      },
      signOut: async () => {
        await signOutSession();
        setSession(null);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
