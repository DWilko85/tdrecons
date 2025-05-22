
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/utils/authUtils";
import { toast } from "sonner";

export const signIn = async (email: string, password: string) => {
  try {
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
    return { success: true };
    
  } catch (error: any) {
    toast.error("Error signing in", {
      description: error.message,
    });
    return { success: false, error };
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  userData?: { username?: string; full_name?: string; client_id?: string }
) => {
  try {
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
    
    return { success: true, data };
    
  } catch (error: any) {
    toast.error("Error signing up", {
      description: error.message,
    });
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
    
    // Clear client state
    localStorage.removeItem('currentClientId');
    
    // Force page reload
    window.location.href = "/auth";
    return { success: true };
    
  } catch (error: any) {
    toast.error("Error signing out", {
      description: error.message,
    });
    return { success: false, error };
  }
};
