import { createClient, type AuthChangeEvent, type Session } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string | null;
  user: AuthUser;
}

interface ProfileResponse {
  id: string;
  email: string;
  username: string;
}

export const supabase = createClient(
  requirePublicEnv(SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
  requirePublicEnv(SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
);

let currentAuthSession: AuthSession | null = null;

function requirePublicEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function toAuthSession(session: Session, user: ProfileResponse): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user,
  };
}

function getUsername(session: Session): string {
  const username = session.user.user_metadata.username;
  return typeof username === "string" && username.trim()
    ? username.trim()
    : session.user.email ?? session.user.id;
}

async function ensureProfile(session: Session): Promise<ProfileResponse> {
  const email = session.user.email;
  if (!email) {
    throw new Error("Supabase user email is missing");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: session.user.id,
        email: email.toLowerCase(),
        username: getUsername(session),
      },
      { onConflict: "id" },
    )
    .select("id, email, username")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(ADMIN_EMAIL && email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session) {
    currentAuthSession = null;
    return null;
  }

  const user = await ensureProfile(data.session);
  currentAuthSession = toAuthSession(data.session, user);
  return currentAuthSession;
}

export function getAccessToken(): string | null {
  return currentAuthSession?.accessToken ?? null;
}

export function onAuthSessionChange(callback: (session: AuthSession | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    if (!session) {
      currentAuthSession = null;
      callback(null);
      return;
    }

    void ensureProfile(session)
      .then((user) => {
        currentAuthSession = toAuthSession(session, user);
        callback(currentAuthSession);
      })
      .catch(() => {
        currentAuthSession = null;
        callback(null);
      });
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session) {
    throw new Error("Supabase did not return a session");
  }

  const user = await ensureProfile(data.session);
  currentAuthSession = toAuthSession(data.session, user);
  return currentAuthSession;
}

export async function signOutSession(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }

  currentAuthSession = null;
}
