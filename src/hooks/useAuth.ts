import { useState, useEffect } from "react";
import { supabase, type User, type AuthState } from "../utils/supabase/client";
import { apiService } from "../services/api";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // 初期セッションをチェック
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.log("Session check error:", error);
          setAuthState({ user: null, loading: false });
          return;
        }

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!,
          };
          localStorage.setItem("supabase_access_token", session.access_token);
          setAuthState({ user, loading: false });
        } else {
          setAuthState({ user: null, loading: false });
        }
      } catch (error) {
        console.log("Session check error:", error);
        setAuthState({ user: null, loading: false });
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!,
        };
        localStorage.setItem("supabase_access_token", session.access_token);
        setAuthState({ user, loading: false });
      } else {
        localStorage.removeItem("supabase_access_token");
        setAuthState({ user: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await apiService.signup(email, password, name);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.log("Sign up error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.log("Sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem("supabase_access_token");
      return { success: true };
    } catch (error) {
      console.log("Sign out error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
}
