-- Create storage bucket for agent conversation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-images', 'agent-images', true);

-- Add attachments column to messages table for storing image URLs
ALTER TABLE public.messages 
ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Create RLS policies for agent-images bucket
CREATE POLICY "Anyone can view agent images"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-images');

CREATE POLICY "Authenticated users can upload agent images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own agent images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own agent images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'agent-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);