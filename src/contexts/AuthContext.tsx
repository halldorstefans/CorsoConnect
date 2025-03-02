import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/router";
import { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/component";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      setSession(sessionData.session);

      // If we have a session, get the user
      if (sessionData.session) {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) {
          throw new Error(`User error: ${userError.message}`);
        }

        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError((err as Error).message);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign out error: ${error.message}`);
      }
      setUser(null);
      setSession(null);
      router.push("/auth");
    } catch (err) {
      console.error("Sign out error:", err);
      setError((err as Error).message);
    }
  }, [supabase.auth, router]);

  // Function to manually refresh user data
  const refreshUser = async () => {
    await fetchUserData();
  };

  // Set up auth state listener on mount
  useEffect(() => {
    fetchUserData();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession) {
          const { data, error } = await supabase.auth.getUser();
          if (!error && data) {
            setUser(data.user);
          }
        } else {
          setUser(null);
        }

        setIsLoading(false);
      },
    );

    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData, supabase.auth]);

  const value = {
    user,
    session,
    isLoading,
    error,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
