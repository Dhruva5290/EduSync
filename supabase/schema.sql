-- =========================================================================
-- Supabase Schema Migration: public.notes
-- Realtime Synchronization & AI Personalization Pipeline
-- =========================================================================

-- 1. Create the notes table with strict status constraints
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

-- 2. Indexes for fast querying & realtime updates
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);

-- 3. Auto-update `updated_at` trigger
CREATE OR REPLACE FUNCTION public.handle_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_notes_updated_at ON public.notes;
CREATE TRIGGER tr_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_notes_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies
-- Policy: Students can view only their own notes
DROP POLICY IF EXISTS "Users can select own notes" ON public.notes;
CREATE POLICY "Users can select own notes"
    ON public.notes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Students can insert their own notes
DROP POLICY IF EXISTS "Users can insert own notes" ON public.notes;
CREATE POLICY "Users can insert own notes"
    ON public.notes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Students can delete their own notes
DROP POLICY IF EXISTS "Users can delete own notes" ON public.notes;
CREATE POLICY "Users can delete own notes"
    ON public.notes
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Students can update their own notes
DROP POLICY IF EXISTS "Users can update own notes" ON public.notes;
CREATE POLICY "Users can update own notes"
    ON public.notes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Service role has full access (Edge Function)
DROP POLICY IF EXISTS "Service role has full access" ON public.notes;
CREATE POLICY "Service role has full access"
    ON public.notes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime Replication for public.notes
-- This permits @supabase/supabase-js to listen for INSERT and UPDATE events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
    END IF;
END $$;

-- =========================================================================
-- Instructions to configure Database Webhook in Supabase Dashboard:
-- 1. In your Supabase Project, go to Database -> Webhooks.
-- 2. Click "Create a new webhook".
-- 3. Name: "personalize_note_on_insert".
-- 4. Table: public.notes.
-- 5. Events: [x] Insert.
-- 6. Webhook Type: "Supabase Edge Function".
-- 7. Edge Function: select "personalize-note".
-- 8. Method: POST, Timeout: 30000ms.
-- =========================================================================
