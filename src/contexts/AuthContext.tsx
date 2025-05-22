
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Client } from "@/types/client";
import { useClientState } from "@/hooks/useClientState";
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  currentClient: Client | null;
  availableClients: Client[];
  setCurrentClient: (client: Client) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: { username?: string; full_name?: string; client_id?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  
  // Use our custom hook for client state management
  const { 
    currentClient, 
    availableClients, 
    loading: clientsLoading, 
    setCurrentClient: handleSetCurrentClient,
    loadUserClients
  } = useClientState(user?.id);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          console.log("Auth state change: SIGNED_IN");
          
          // Defer loading client data to prevent deadlocks
          if (session?.user) {
            setTimeout(() => {
              loadUserClients(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Auth state change: SIGNED_OUT");
          handleSetCurrentClient(null);
          localStorage.removeItem('currentClientId');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await authSignIn(email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: { username?: string; full_name?: string; client_id?: string }) => {
    setAuthLoading(true);
    try {
      const result = await authSignUp(email, password, userData);
      if (result.success) {
        navigate("/");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await authSignOut();
    } finally {
      setAuthLoading(false);
    }
  };

  // Combine loading states
  const loading = authLoading || clientsLoading;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      currentClient,
      availableClients,
      setCurrentClient: handleSetCurrentClient,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
