-- Create workspace_role enum
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create invitation_status enum
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  shared_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- Create workspace_invitations table
CREATE TABLE public.workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  role workspace_role NOT NULL DEFAULT 'viewer',
  status invitation_status NOT NULL DEFAULT 'pending',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add workspace_id to agents table
ALTER TABLE public.agents ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- Helper function to check workspace admin/owner status
CREATE OR REPLACE FUNCTION public.is_workspace_admin(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id 
      AND workspace_id = _workspace_id 
      AND role IN ('owner', 'admin')
  )
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(auth.uid(), id) OR is_public = true);

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (public.is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can update members"
ON public.workspace_members FOR UPDATE
USING (public.is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can remove members"
ON public.workspace_members FOR DELETE
USING (public.is_workspace_admin(auth.uid(), workspace_id));

-- RLS Policies for workspace_invitations
CREATE POLICY "Admins can view invitations"
ON public.workspace_invitations FOR SELECT
USING (public.is_workspace_admin(auth.uid(), workspace_id) OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can create invitations"
ON public.workspace_invitations FOR INSERT
WITH CHECK (public.is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can update invitations"
ON public.workspace_invitations FOR UPDATE
USING (public.is_workspace_admin(auth.uid(), workspace_id) OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete invitations"
ON public.workspace_invitations FOR DELETE
USING (public.is_workspace_admin(auth.uid(), workspace_id));

-- Update agents RLS to include workspace access
CREATE POLICY "Users can view workspace agents"
ON public.agents FOR SELECT
USING (auth.uid() = user_id OR (workspace_id IS NOT NULL AND public.is_workspace_member(auth.uid(), workspace_id)));

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();