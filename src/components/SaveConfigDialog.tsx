
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { DataSourceConfig } from "@/types/dataSources";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DataSourceConfig;
}

const SaveConfigDialog: React.FC<SaveConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${config.sourceA?.name || 'Source A'} to ${config.sourceB?.name || 'Source B'} Config`,
      description: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        toast.error("Please sign in to save configurations");
        return;
      }

      // Convert the config object to a plain object first
      const configCopy = JSON.parse(JSON.stringify(config));

      const { error } = await supabase
        .from('reconciliation_configs')
        .insert({
          name: values.name,
          description: values.description,
          config: configCopy,
          source_a_id: config.sourceA?.id,
          source_b_id: config.sourceB?.id,
          user_id: userId
        });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      toast.success("Configuration saved successfully");
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving configuration:", err);
      toast.error("Failed to save configuration");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Save this reconciliation configuration to use it later
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a name for this configuration" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add additional notes or context"
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveConfigDialog;
