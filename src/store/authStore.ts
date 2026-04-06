import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google';
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  signup: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: true,

  signup: async (email, name, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Supabase returns a user even before email verification
    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      return { success: true, needsVerification: true };
    }

    if (data.user && data.session) {
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || name,
        provider: 'email',
        emailVerified: !!data.user.email_confirmed_at,
      };
      set({ user, isLoggedIn: true });
      return { success: true };
    }

    return { success: false, error: 'Signup failed. Please try again.' };
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'Please verify your email address first. Check your inbox.' };
      }
      return { success: false, error: error.message };
    }

    if (data.user) {
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || '',
        provider: 'email',
        emailVerified: !!data.user.email_confirmed_at,
      };
      set({ user, isLoggedIn: true });
      return { success: true };
    }

    return { success: false, error: 'Login failed. Please try again.' };
  },

  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // OAuth redirects the user, so we won't reach here immediately
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isLoggedIn: false });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  hydrate: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || '',
        provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        emailVerified: !!session.user.email_confirmed_at,
      };
      set({ user, isLoggedIn: true, loading: false });
    } else {
      set({ user: null, isLoggedIn: false, loading: false });
    }

    // Listen for auth state changes (e.g., email verification callback, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || '',
          provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
          emailVerified: !!session.user.email_confirmed_at,
        };
        set({ user, isLoggedIn: true, loading: false });
      } else {
        set({ user: null, isLoggedIn: false, loading: false });
      }
    });
  },
}));
