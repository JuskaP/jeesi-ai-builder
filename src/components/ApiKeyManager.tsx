import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    // Only select non-sensitive columns - never expose key_hash
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, key_name, key_prefix, last_used_at, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API keys:", error);
      return;
    }

    setApiKeys(data || []);
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    setLoading(true);
    try {
      // Generate random API key
      const randomKey = `jsk_${generateRandomString(32)}`;
      
      // Hash the key
      const keyHash = await hashKey(randomKey);
      const keyPrefix = randomKey.substring(0, 11) + "...";

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Store hashed key
      const { error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          key_name: newKeyName,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        });

      if (error) throw error;

      setGeneratedKey(randomKey);
      setNewKeyName("");
      toast.success("API key created!");
      fetchApiKeys();
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
      return;
    }

    toast.success("API key deleted");
    fetchApiKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {generatedKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">New API Key Created</CardTitle>
              <CardDescription>
                Save this key in a secure location. You won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input value={generatedKey} readOnly className="font-mono" />
                <Button onClick={() => copyToClipboard(generatedKey)} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => setGeneratedKey(null)}
                className="mt-4 w-full"
                variant="secondary"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            Create an API key to embed your agent on websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Key name (e.g., 'Production Website')"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={generateApiKey} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing API Keys</CardTitle>
          <CardDescription>Manage your existing API keys</CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No API keys yet. Create your first key above.
            </p>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{key.key_name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {key.key_prefix}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {key.last_used_at
                        ? `Last used: ${new Date(key.last_used_at).toLocaleDateString()}`
                        : "Never used"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
