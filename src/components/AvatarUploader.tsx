import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, Loader2, User, Briefcase, Palette, Shapes, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userInitials?: string;
  onAvatarChange: (url: string) => void;
}

const AVATAR_PRESETS = [
  {
    id: "professional",
    name: "Professional",
    icon: Briefcase,
    prompt: "A professional corporate headshot portrait, clean and polished look, soft studio lighting, neutral gray background, business attire, confident expression, high quality photograph style"
  },
  {
    id: "cartoon",
    name: "Cartoon",
    icon: Palette,
    prompt: "A friendly cartoon avatar character, colorful and playful style, big expressive eyes, smooth vector art style, vibrant colors, fun personality, suitable for profile picture"
  },
  {
    id: "abstract",
    name: "Abstract",
    icon: Shapes,
    prompt: "An abstract geometric avatar design, modern art style, bold shapes and colors, unique artistic interpretation, creative and eye-catching, contemporary digital art"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    icon: Minus,
    prompt: "A minimalist avatar design, simple clean lines, monochromatic or limited color palette, elegant and understated, modern aesthetic, zen-like simplicity"
  }
];

export default function AvatarUploader({ 
  userId, 
  currentAvatarUrl, 
  userInitials = "U",
  onAvatarChange 
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateAvatar = async (presetPrompt?: string) => {
    const promptToUse = presetPrompt || aiPrompt;
    if (!promptToUse && !presetPrompt) {
      toast.error("Please select a style or enter a description");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { prompt: promptToUse }
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image generated");

      // Convert base64 to blob and upload
      const base64Data = data.imageUrl.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      const fileName = `${userId}/${Date.now()}-ai.png`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
      toast.success("AI avatar generated and saved");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate avatar");
    } finally {
      setIsGenerating(false);
      setSelectedPreset(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile Avatar</CardTitle>
        <CardDescription>Upload your own photo or generate an AI avatar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={currentAvatarUrl || undefined} alt="Profile" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {userInitials || <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-2">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={isUploading} asChild>
                  <span>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo
                  </span>
                </Button>
              </div>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h4 className="font-medium">Generate AI Avatar</h4>
          </div>

          {/* Preset Styles */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Quick Styles</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.id}
                    variant={selectedPreset === preset.id ? "default" : "outline"}
                    size="sm"
                    className="flex flex-col h-auto py-3 gap-1"
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setAiPrompt("");
                    }}
                    disabled={isGenerating}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Or describe your own style</Label>
            <Textarea
              placeholder="e.g., 'futuristic cyberpunk style with neon colors' or 'watercolor painting with soft pastels'"
              value={aiPrompt}
              onChange={(e) => {
                setAiPrompt(e.target.value);
                setSelectedPreset(null);
              }}
              rows={2}
              disabled={isGenerating}
            />
          </div>
          
          <Button 
            onClick={() => {
              const preset = AVATAR_PRESETS.find(p => p.id === selectedPreset);
              handleGenerateAvatar(preset?.prompt);
            }} 
            disabled={isGenerating || (!selectedPreset && !aiPrompt)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating {selectedPreset ? AVATAR_PRESETS.find(p => p.id === selectedPreset)?.name : "Custom"} Avatar...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate {selectedPreset ? AVATAR_PRESETS.find(p => p.id === selectedPreset)?.name + " " : ""}Avatar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
