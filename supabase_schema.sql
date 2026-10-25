-- ====================================================================
-- HYPERDRIVE: SUNSET ROADSTER — SUPABASE DATABASE SCHEMA
-- ====================================================================
-- Run this complete script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> Click "+ New query" -> Paste & Run
-- ====================================================================

-- 1. LEADERBOARD TABLE (Global Top 10 & High Scores)
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anonymous Driver',
    score BIGINT NOT NULL,
    distance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant leaderboard ranking and sorting
CREATE INDEX IF NOT EXISTS idx_leaderboard_score_desc ON public.leaderboard (score DESC);

-- 2. USER WALLETS TABLE (Coin balances & progression)
CREATE TABLE IF NOT EXISTS public.user_wallets (
    user_id TEXT PRIMARY KEY,
    coins INTEGER NOT NULL DEFAULT 500,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MULTIPLAYER MATCHES TABLE (PVP Match History & Wagers)
CREATE TABLE IF NOT EXISTS public.multiplayer_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'guest',
    wager INTEGER NOT NULL DEFAULT 100,
    won BOOLEAN NOT NULL DEFAULT false,
    player_score BIGINT NOT NULL DEFAULT 0,
    rival_score BIGINT NOT NULL DEFAULT 0,
    rival_name TEXT NOT NULL DEFAULT 'Rival Roadster',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.multiplayer_matches (created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Enables anonymous client-side game traffic (anon key) to read & write 
-- game records without exposing any server secrets.

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.multiplayer_matches ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies (Anyone can view scores and submit their run)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view leaderboard" ON public.leaderboard;
    CREATE POLICY "Public can view leaderboard" 
        ON public.leaderboard FOR SELECT 
        TO anon, authenticated 
        USING (true);

    DROP POLICY IF EXISTS "Public can insert scores" ON public.leaderboard;
    CREATE POLICY "Public can insert scores" 
        ON public.leaderboard FOR INSERT 
        TO anon, authenticated 
        WITH CHECK (true);
END $$;

-- User wallets policies (Players can read and update their coin count)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view user wallets" ON public.user_wallets;
    CREATE POLICY "Public can view user wallets" 
        ON public.user_wallets FOR SELECT 
        TO anon, authenticated 
        USING (true);

    DROP POLICY IF EXISTS "Public can insert user wallets" ON public.user_wallets;
    CREATE POLICY "Public can insert user wallets" 
        ON public.user_wallets FOR INSERT 
        TO anon, authenticated 
        WITH CHECK (true);

    DROP POLICY IF EXISTS "Public can update user wallets" ON public.user_wallets;
    CREATE POLICY "Public can update user wallets" 
        ON public.user_wallets FOR UPDATE 
        TO anon, authenticated 
        USING (true);
END $$;

-- Multiplayer matches policies (Record match outcomes and history)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view matches" ON public.multiplayer_matches;
    CREATE POLICY "Public can view matches" 
        ON public.multiplayer_matches FOR SELECT 
        TO anon, authenticated 
        USING (true);

    DROP POLICY IF EXISTS "Public can record matches" ON public.multiplayer_matches;
    CREATE POLICY "Public can record matches" 
        ON public.multiplayer_matches FOR INSERT 
        TO anon, authenticated 
        WITH CHECK (true);
END $$;
