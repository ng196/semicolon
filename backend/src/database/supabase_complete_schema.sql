-- CampusHub Complete Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  specialization TEXT,
  year TEXT,
  interests TEXT,
  online_status INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ,
  attendance_rate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hubs table
CREATE TABLE IF NOT EXISTS hubs (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  specialization TEXT,
  year TEXT,
  creator_id BIGINT NOT NULL REFERENCES users(id),
  rating REAL DEFAULT 0.0,
  color TEXT,
  search_tsv tsvector,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hub members
CREATE TABLE IF NOT EXISTS hub_members (
  id BIGSERIAL PRIMARY KEY,
  hub_id BIGINT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hub_id, user_id)
);

-- Hub interests
CREATE TABLE IF NOT EXISTS hub_interests (
  id BIGSERIAL PRIMARY KEY,
  hub_id BIGINT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  interest TEXT NOT NULL
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  specialization TEXT,
  attending INTEGER DEFAULT 0,
  attending_count BIGINT DEFAULT 0,
  capacity INTEGER DEFAULT 100,
  color TEXT,
  search_tsv tsvector,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  image TEXT,
  seller_id BIGINT NOT NULL REFERENCES users(id),
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  seller_rating REAL DEFAULT 0,
  liked INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  search_tsv tsvector,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  submitted_to TEXT NOT NULL,
  category TEXT NOT NULL,
  submitter_id BIGINT NOT NULL REFERENCES users(id),
  submitter_name TEXT NOT NULL,
  submitter_avatar TEXT,
  supporters INTEGER DEFAULT 0,
  required INTEGER DEFAULT 30,
  progress INTEGER DEFAULT 0,
  resolution TEXT,
  response_time TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CLUB FEATURES
-- ============================================

-- Club settings
CREATE TABLE IF NOT EXISTS club_settings (
  id BIGSERIAL PRIMARY KEY,
  hub_id BIGINT NOT NULL UNIQUE REFERENCES hubs(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  auto_approve_members BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Club join requests
CREATE TABLE IF NOT EXISTS club_join_requests (
  id BIGSERIAL PRIMARY KEY,
  club_id BIGINT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  message TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by BIGINT REFERENCES users(id),
  UNIQUE(club_id, user_id)
);

-- Club posts
CREATE TABLE IF NOT EXISTS club_posts (
  id BIGSERIAL PRIMARY KEY,
  club_id BIGINT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Club events linking
CREATE TABLE IF NOT EXISTS club_events (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  club_id BIGINT NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'public',
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EVENT FEATURES
-- ============================================

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- MARKETPLACE FEATURES
-- ============================================

-- Item likes
CREATE TABLE IF NOT EXISTS item_likes (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (item_id, user_id)
);

-- ============================================
-- SYSTEM FEATURES
-- ============================================

-- Media management
CREATE TABLE IF NOT EXISTS media (
  id BIGSERIAL PRIMARY KEY,
  owner_table TEXT,
  owner_id BIGINT,
  storage_path TEXT,
  filename TEXT,
  mime TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT,
  action TEXT NOT NULL,
  table_name TEXT,
  row_id BIGINT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END$$;

-- Function to update search tsvector
CREATE OR REPLACE FUNCTION refresh_search_tsv() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'hubs' THEN
    NEW.search_tsv := to_tsvector('english', 
      coalesce(NEW.name,'') || ' ' || 
      coalesce(NEW.description,'') || ' ' || 
      coalesce(NEW.specialization,'')
    );
  ELSIF TG_TABLE_NAME = 'events' THEN
    NEW.search_tsv := to_tsvector('english', 
      coalesce(NEW.name,'') || ' ' || 
      coalesce(NEW.description,'') || ' ' || 
      coalesce(NEW.location,'') || ' ' || 
      coalesce(NEW.organizer,'')
    );
  ELSIF TG_TABLE_NAME = 'marketplace_items' THEN
    NEW.search_tsv := to_tsvector('english', 
      coalesce(NEW.title,'') || ' ' || 
      coalesce(NEW.description,'') || ' ' || 
      coalesce(NEW.category,'')
    );
  END IF;
  RETURN NEW;
END$$;

-- Function to maintain event attending count
CREATE OR REPLACE FUNCTION events_attending_counter() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'going') THEN
    UPDATE events SET attending_count = attending_count + 1 WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'going') THEN
    UPDATE events SET attending_count = GREATEST(attending_count - 1, 0) WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.status <> 'going' AND NEW.status = 'going' THEN
      UPDATE events SET attending_count = attending_count + 1 WHERE id = NEW.event_id;
    ELSIF OLD.status = 'going' AND NEW.status <> 'going' THEN
      UPDATE events SET attending_count = GREATEST(attending_count - 1, 0) WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS trg_club_posts_updated ON club_posts;
CREATE TRIGGER trg_club_posts_updated
  BEFORE UPDATE ON club_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_event_rsvps_updated ON event_rsvps;
CREATE TRIGGER trg_event_rsvps_updated
  BEFORE UPDATE ON event_rsvps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Search tsvector triggers
DROP TRIGGER IF EXISTS trg_hubs_search ON hubs;
CREATE TRIGGER trg_hubs_search
  BEFORE INSERT OR UPDATE ON hubs
  FOR EACH ROW EXECUTE FUNCTION refresh_search_tsv();

DROP TRIGGER IF EXISTS trg_events_search ON events;
CREATE TRIGGER trg_events_search
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION refresh_search_tsv();

DROP TRIGGER IF EXISTS trg_items_search ON marketplace_items;
CREATE TRIGGER trg_items_search
  BEFORE INSERT OR UPDATE ON marketplace_items
  FOR EACH ROW EXECUTE FUNCTION refresh_search_tsv();

-- Event attending counter triggers
DROP TRIGGER IF EXISTS trg_event_rsvps_counter_ins ON event_rsvps;
CREATE TRIGGER trg_event_rsvps_counter_ins 
  AFTER INSERT ON event_rsvps 
  FOR EACH ROW EXECUTE FUNCTION events_attending_counter();

DROP TRIGGER IF EXISTS trg_event_rsvps_counter_del ON event_rsvps;
CREATE TRIGGER trg_event_rsvps_counter_del 
  AFTER DELETE ON event_rsvps 
  FOR EACH ROW EXECUTE FUNCTION events_attending_counter();

DROP TRIGGER IF EXISTS trg_event_rsvps_counter_upd ON event_rsvps;
CREATE TRIGGER trg_event_rsvps_counter_upd 
  AFTER UPDATE ON event_rsvps 
  FOR EACH ROW EXECUTE FUNCTION events_attending_counter();

-- ============================================
-- INDEXES
-- ============================================

-- Primary search indexes
CREATE INDEX IF NOT EXISTS idx_hubs_search ON hubs USING GIN(search_tsv);
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN(search_tsv);
CREATE INDEX IF NOT EXISTS idx_items_search ON marketplace_items USING GIN(search_tsv);

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_hubs_name_trgm ON hubs USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_name_trgm ON events USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_title_trgm ON marketplace_items USING GIN (title gin_trgm_ops);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_events_starts_at_category ON events (starts_at, category);
CREATE INDEX IF NOT EXISTS idx_hubs_type_specialization ON hubs (type, specialization);
CREATE INDEX IF NOT EXISTS idx_marketplace_category_price ON marketplace_items (category, price);
CREATE INDEX IF NOT EXISTS idx_hub_members_hub_user ON hub_members (hub_id, user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_user ON event_rsvps (event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_items (seller_id);
CREATE INDEX IF NOT EXISTS idx_item_likes_item ON item_likes(item_id);
CREATE INDEX IF NOT EXISTS idx_item_likes_user ON item_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_media_owner ON media(owner_table, owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_by_actor ON audit_logs(actor_id);

-- ============================================
-- NO RLS FOR NOW - WILL ADD LATER
-- ============================================

-- RLS is disabled by default, so all operations are allowed
-- We'll add proper authentication and RLS policies later