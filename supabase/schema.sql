-- ==============================================================================
-- SAFEGUARD AI - OFFICIAL SUPABASE POSTGRESQL SCHEMA WITH RLS BEST PRACTICES
-- ==============================================================================
-- Designed following official Supabase & Postgres Best Practices:
-- 1. Explicit 'TO authenticated' role scoping
-- 2. Performance-optimized '(SELECT auth.uid())' subqueries for RLS evaluation
-- 3. Dual 'USING' and 'WITH CHECK' clauses on UPDATE policies to prevent IDOR / re-assignment
-- 4. Foreign key indexes on all user_id and incident_id columns for rapid lookups
-- 5. Isolated private storage bucket policies for 'evidence-vault'

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'harassment',
        'stalking',
        'cyberbullying',
        'threats',
        'blackmail',
        'relationship_disputes',
        'possible_deception',
        'other'
    )),
    status TEXT NOT NULL DEFAULT 'preserved' CHECK (status IN (
        'draft',
        'under_review',
        'preserved',
        'resolved',
        'archived'
    )),
    severity_self_rating TEXT NOT NULL DEFAULT 'moderate' CHECK (severity_self_rating IN ('mild', 'moderate', 'severe')),
    perpetrator_name TEXT,
    perpetrator_handle TEXT,
    perpetrator_relationship TEXT,
    location_or_platform TEXT NOT NULL,
    narrative TEXT NOT NULL,
    impact_description TEXT,
    witness_notes TEXT,
    ai_classification JSONB,
    risk_assessment JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Indexes for optimal RLS lookup and filtering
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents (user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON public.incidents (incident_date DESC);

CREATE POLICY "Users can view own incidents"
    ON public.incidents FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own incidents"
    ON public.incidents FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own incidents"
    ON public.incidents FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own incidents"
    ON public.incidents FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 3. EVIDENCE ITEMS TABLE (With Cryptographic SHA-256 Hashing)
CREATE TABLE IF NOT EXISTS public.evidence_items (
    id TEXT PRIMARY KEY,
    incident_id TEXT REFERENCES public.incidents(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('photo', 'video', 'screenshot', 'audio', 'document', 'other')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    is_private_storage BOOLEAN DEFAULT true NOT NULL,
    ai_analysis_enabled BOOLEAN DEFAULT false NOT NULL, -- STRICT SECURITY: OFF by default
    ocr_extracted_text TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;

-- Indexes for evidence lookup & RLS performance
CREATE INDEX IF NOT EXISTS idx_evidence_items_user_id ON public.evidence_items (user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_incident_id ON public.evidence_items (incident_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_sha256 ON public.evidence_items (sha256_hash);

CREATE POLICY "Users can view own evidence"
    ON public.evidence_items FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own evidence"
    ON public.evidence_items FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own evidence"
    ON public.evidence_items FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own evidence"
    ON public.evidence_items FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 4. TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id TEXT PRIMARY KEY,
    incident_id TEXT REFERENCES public.incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    source TEXT NOT NULL CHECK (source IN ('manual', 'incident', 'evidence')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Indexes for chronological queries & RLS performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events (user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_incident_id ON public.timeline_events (incident_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_date ON public.timeline_events (event_date DESC);

CREATE POLICY "Users can view own timeline events"
    ON public.timeline_events FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own timeline events"
    ON public.timeline_events FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own timeline events"
    ON public.timeline_events FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 5. PRIVATE STORAGE BUCKET CONFIGURATION ('evidence-vault')
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('evidence-vault', 'evidence-vault', false, 104857600) -- 100MB limit
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage Row-Level Security Policies for 'evidence-vault'
-- Users can only upload, read, and delete files inside their own folder: <auth.uid()>/...
CREATE POLICY "Users can upload evidence into their own folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'evidence-vault' AND
        (storage.foldername(name))[1] = (SELECT auth.uid())::text
    );

CREATE POLICY "Users can view evidence in their own folder"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'evidence-vault' AND
        (storage.foldername(name))[1] = (SELECT auth.uid())::text
    );

CREATE POLICY "Users can delete evidence in their own folder"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'evidence-vault' AND
        (storage.foldername(name))[1] = (SELECT auth.uid())::text
    );
