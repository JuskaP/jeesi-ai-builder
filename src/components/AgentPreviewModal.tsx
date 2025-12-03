import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Edit2 } from "lucide-react";

export interface AgentConfig {
  name: string;
  purpose: string;
  description: string;
  system_prompt: string;
}

interface AgentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig | null;
  onConfirm: (config: AgentConfig) => void;
  isCreating: boolean;
}

export default function AgentPreviewModal({
  isOpen,
  onClose,
  config,
  onConfirm,
  isCreating
}: AgentPreviewModalProps) {
  const [editedConfig, setEditedConfig] = useState<AgentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const currentConfig = editedConfig || config;

  const handleEdit = () => {
    setEditedConfig(config ? { ...config } : null);
    setIsEditing(true);
  };

  const handleConfirm = () => {
    if (currentConfig) {
      onConfirm(currentConfig);
    }
  };

  if (!config) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Review Your Agent Configuration
          </DialogTitle>
          <DialogDescription>
            Helpie analyzed your conversation and created this agent. Review and adjust if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={currentConfig?.name || ""}
                onChange={(e) => setEditedConfig(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            ) : (
              <p className="p-3 rounded-lg bg-muted text-foreground font-medium">{currentConfig?.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Category / Purpose</Label>
            {isEditing ? (
              <Input
                id="purpose"
                value={currentConfig?.purpose || ""}
                onChange={(e) => setEditedConfig(prev => prev ? { ...prev, purpose: e.target.value } : null)}
              />
            ) : (
              <p className="p-3 rounded-lg bg-muted text-foreground">{currentConfig?.purpose}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={currentConfig?.description || ""}
                onChange={(e) => setEditedConfig(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={2}
              />
            ) : (
              <p className="p-3 rounded-lg bg-muted text-foreground text-sm">{currentConfig?.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="system_prompt">System Prompt (Agent Behavior)</Label>
            {isEditing ? (
              <Textarea
                id="system_prompt"
                value={currentConfig?.system_prompt || ""}
                onChange={(e) => setEditedConfig(prev => prev ? { ...prev, system_prompt: e.target.value } : null)}
                rows={8}
                className="font-mono text-xs"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted text-foreground text-xs font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                {currentConfig?.system_prompt}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleConfirm} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Agent
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditedConfig(null); }}>
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
