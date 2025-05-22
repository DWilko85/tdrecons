
export interface Client {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserClient {
  id: string;
  user_id: string;
  client_id: string;
  created_at: string;
}
