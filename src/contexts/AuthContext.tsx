
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Client } from "@/types/client";
import { cleanupAuthState } from "@/utils/authUtils";

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
  const [loading, setLoading] = useState(true);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  // Load user's clients
  const loadUserClients = async (userId: string) => {
    try {
      const { data: userClients, error: userClientsError } = await supabase
        .from('user_clients')
        .select('client_id')
        .eq('user_id', userId);

      if (userClientsError) {
        throw userClientsError;
      }

      if (userClients?.length) {
        const clientIds = userClients.map(uc => uc.client_id);
        
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .in('id', clientIds);

        if (clientsError) {
          throw clientsError;
        }

        if (clients?.length) {
          setAvailableClients(clients);
          // Set the first client as current if there's no current client
          if (!currentClient) {
            setCurrentClient(clients[0]);
            // Store in local storage to persist the selection
            localStorage.setItem('currentClientId', clients[0].id);
          }
        }
      } else {
        console.log("User doesn't belong to any clients");
        setAvailableClients([]);
        setCurrentClient(null);
      }
    } catch (error) {
      console.error("Error loading user clients:", error);
      toast.error("Failed to load client information");
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          toast.success("Signed in successfully", {
            description: "Welcome back!",
          });
          
          // Defer loading client data to prevent deadlocks
          if (session?.user) {
            setTimeout(() => {
              loadUserClients(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentClient(null);
          setAvailableClients([]);
          localStorage.removeItem('currentClientId');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Try to load previously selected client from localStorage
        const savedClientId = localStorage.getItem('currentClientId');
        if (savedClientId) {
          supabase
            .from('clients')
            .select('*')
            .eq('id', savedClientId)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setCurrentClient(data);
              }
              // Load all available clients regardless
              loadUserClients(session.user.id);
            });
        } else {
          loadUserClients(session.user.id);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Force page reload for clean state
      window.location.href = "/";
    } catch (error: any) {
      toast.error("Error signing in", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: { username?: string; full_name?: string; client_id?: string }) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      // Create user-client association if client_id is provided
      if (data.user && userData?.client_id) {
        const { error: clientError } = await supabase
          .from('user_clients')
          .insert({
            user_id: data.user.id,
            client_id: userData.client_id
          });
          
        if (clientError) {
          console.error("Error associating user with client:", clientError);
          toast.error("Failed to associate user with client", {
            description: clientError.message,
          });
        }
      }
      
      toast.success("Signed up successfully", {
        description: "Please check your email to confirm your account.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing up", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      // Clear client state
      setCurrentClient(null);
      setAvailableClients([]);
      localStorage.removeItem('currentClientId');
      
      // Force page reload
      window.location.href = "/auth";
    } catch (error: any) {
      toast.error("Error signing out", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrentClient = (client: Client) => {
    setCurrentClient(client);
    localStorage.setItem('currentClientId', client.id);
  };

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
