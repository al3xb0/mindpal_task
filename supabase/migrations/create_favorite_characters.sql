-- Migration: Create favorite_characters table
-- Description: Table to store user's favorite Rick & Morty characters

-- Create favorite_characters table
CREATE TABLE IF NOT EXISTS public.favorite_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character_id INTEGER NOT NULL,
    character_name TEXT NOT NULL,
    character_image TEXT,
    character_status TEXT,
    character_species TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique constraint: user can only favorite a character once
    CONSTRAINT unique_user_character UNIQUE (user_id, character_id)
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_favorite_characters_user_id 
ON public.favorite_characters(user_id);

-- Create index for faster queries by character_id
CREATE INDEX IF NOT EXISTS idx_favorite_characters_character_id 
ON public.favorite_characters(character_id);

-- Enable Row Level Security
ALTER TABLE public.favorite_characters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own favorites
CREATE POLICY "Users can view own favorites"
ON public.favorite_characters
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own favorites
CREATE POLICY "Users can insert own favorites"
ON public.favorite_characters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own favorites
CREATE POLICY "Users can delete own favorites"
ON public.favorite_characters
FOR DELETE
USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.favorite_characters TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
