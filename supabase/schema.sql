-- ======================================================================================
-- EduSync & VisionNote: Complete Master Database Setup Script
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- ======================================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing triggers & policies if recreating
DROP TRIGGER IF EXISTS tr_notes_updated_at ON public.notes;
DROP FUNCTION IF EXISTS public.handle_notes_updated_at();

DROP POLICY IF EXISTS "Users can select own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
DROP POLICY IF EXISTS "Service role full access" ON public.notes;
DROP POLICY IF EXISTS "Anon client access" ON public.notes;
DROP POLICY IF EXISTS "Allow authenticated and service role" ON public.notes;

-- 3. Create the `public.notes` Table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Capture',
    raw_ocr_text TEXT,
    generalised_notes TEXT NOT NULL,
    personalised_notes TEXT,
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Set REPLICA IDENTITY FULL
-- (Crucial: Guarantees that Supabase Realtime emits full record payload on UPDATE events)
ALTER TABLE public.notes REPLICA IDENTITY FULL;

-- 5. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- 6. Trigger to automatically keep `updated_at` current on row updates
CREATE OR REPLACE FUNCTION public.handle_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_notes_updated_at();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies
-- (A) Authenticated users: restricted to their own notes
CREATE POLICY "Users can select own notes"
    ON public.notes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON public.notes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON public.notes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON public.notes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- (B) Service Role: Full unrestricted access for the Edge Function
CREATE POLICY "Service role full access"
    ON public.notes FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- (C) Optional Anon Access: Allows Python Desktop Client with Anon Key to push notes
CREATE POLICY "Anon client access"
    ON public.notes FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 9. Add Table to Supabase Realtime Publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
    END IF;
END $$;

-- Verification query
SELECT 'Success! public.notes is created with RLS, Realtime, and Triggers.' AS status;
