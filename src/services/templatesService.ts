
import { supabase } from "@/integrations/supabase/client";
import { DataSourceConfig, FieldMapping } from "@/types/dataSources";
import { Json } from "@/integrations/supabase/types";

export interface Template {
  id: string;
  name: string;
  description?: string;
  config: {
    mappings: FieldMapping[];
    keyMapping: {
      sourceAField: string;
      sourceBField: string;
    };
  };
  source_a_id?: string;
  source_b_id?: string;
  created_at: string;
  updated_at: string;
}

export async function saveTemplate(
  name: string,
  description: string | null,
  config: Pick<DataSourceConfig, 'mappings' | 'keyMapping'>,
  sourceAId?: string,
  sourceBId?: string
): Promise<boolean> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      console.error("No user ID available when saving template");
      return false;
    }
    
    const templateData = {
      name,
      description,
      config: {
        mappings: config.mappings,
        keyMapping: config.keyMapping
      } as unknown as Json,
      user_id: userId,
      source_a_id: sourceAId,
      source_b_id: sourceBId
    };
    
    const { error } = await supabase
      .from('templates')
      .insert(templateData);
    
    if (error) {
      console.error("Error saving template:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in saveTemplate:", err);
    return false;
  }
}

export async function getTemplates(): Promise<Template[]> {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
    
    return data as Template[];
  } catch (err) {
    console.error("Error in getTemplates:", err);
    return [];
  }
}

export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting template:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in deleteTemplate:", err);
    return false;
  }
}
