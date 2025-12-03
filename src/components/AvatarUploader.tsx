import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userInitials?: string;
  onAvatarChange: (url: string) => void;
}

export default function AvatarUploader({ 
  userId, 
  currentAvatarUrl, 
  userInitials = "U",
  onAvatarChange 
}: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { prompt: aiPrompt || undefined }
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
          
          <Textarea
            placeholder="Describe your desired avatar style... (e.g., 'professional headshot with blue background' or 'cartoon style with friendly smile')"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
          />
          
          <Button 
            onClick={handleGenerateAvatar} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Avatar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
