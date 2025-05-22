
import { useState, useEffect } from "react";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useClientState = (userId: string | undefined) => {
  const [currentClient, setCurrentClientState] = useState<Client | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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
          
          // Try to load previously selected client from localStorage
          const savedClientId = localStorage.getItem('currentClientId');
          
          if (savedClientId) {
            // Check if the saved client is in available clients
            const savedClient = clients.find(c => c.id === savedClientId);
            if (savedClient) {
              setCurrentClientState(savedClient);
              return; // Exit early if we found and set the saved client
            }
          }
          
          // If no saved client or saved client not found in available clients,
          // automatically set the first client as current if there's only one
          if (clients.length === 1) {
            setCurrentClientState(clients[0]);
            localStorage.setItem('currentClientId', clients[0].id);
          } else if (!currentClient && clients.length > 0) {
            // If multiple clients but none selected, select the first one
            setCurrentClientState(clients[0]);
            localStorage.setItem('currentClientId', clients[0].id);
          }
        }
      } else {
        console.log("User doesn't belong to any clients");
        setAvailableClients([]);
        setCurrentClientState(null);
      }
    } catch (error) {
      console.error("Error loading user clients:", error);
      toast.error("Failed to load client information");
    } finally {
      setLoading(false);
    }
  };

  // Handle client changes and persistence
  const setCurrentClient = (client: Client) => {
    setCurrentClientState(client);
    localStorage.setItem('currentClientId', client.id);
  };

  useEffect(() => {
    if (userId) {
      loadUserClients(userId);
    } else {
      setLoading(false);
      setAvailableClients([]);
      setCurrentClientState(null);
    }
  }, [userId]);

  return {
    currentClient,
    availableClients,
    loading,
    setCurrentClient,
    loadUserClients
  };
};
