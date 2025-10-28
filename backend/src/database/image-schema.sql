-- Image Records Table with Role-Based Access Control
-- This table stores all image metadata and access control information

CREATE TABLE IF NOT EXISTS image_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(255) NOT NULL UNIQUE,
    secure_url TEXT NOT NULL,
    image_type VARCHAR(50) NOT NULL CHECK (
        image_type IN (
            'user_pfp', 'user_banner', 'club_icon', 'club_banner',
            'event_banner', 'event_gallery', 'marketplace_item',
            'post_attachment', 'general_upload'
        )
    ),
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_id INTEGER, -- References the related entity (club_id, event_id, etc.)
    entity_type VARCHAR(50), -- 'club', 'event', 'user', 'marketplace'
    tags TEXT[] DEFAULT '{}', -- Array of tags for categorization
    metadata JSONB DEFAULT '{}', -- Additional metadata (dimensions, file size, etc.)
    access_level VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (
        access_level IN ('owner', 'admin', 'moderator', 'member', 'public', 'none')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_records_uploaded_by ON image_records(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_records_image_type ON image_records(image_type);
CREATE INDEX IF NOT EXISTS idx_image_records_entity ON image_records(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_image_records_tags ON image_records USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_image_records_created_at ON image_records(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_image_records_type_entity ON image_records(image_type, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_image_records_user_type ON image_records(uploaded_by, image_type);

-- RLS (Row Level Security) Policies
ALTER TABLE image_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can always see their own images
CREATE POLICY "Users can view own images" ON image_records
    FOR SELECT USING (uploaded_by = auth.uid()::integer);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own images" ON image_records
    FOR UPDATE USING (uploaded_by = auth.uid()::integer);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images" ON image_records
    FOR DELETE USING (uploaded_by = auth.uid()::integer);

-- Policy: Public images are viewable by all authenticated users
CREATE POLICY "Public images viewable by all" ON image_records
    FOR SELECT USING (access_level = 'public');

-- Policy: Member-level images viewable by club/event members
CREATE POLICY "Member images viewable by members" ON image_records
    FOR SELECT USING (
        access_level = 'member' AND (
            -- Club members can see club images
            (entity_type = 'club' AND EXISTS (
                SELECT 1 FROM hub_members 
                WHERE hub_id = image_records.entity_id 
                AND user_id = auth.uid()::integer
            )) OR
            -- Event attendees can see event images
            (entity_type = 'event' AND EXISTS (
                SELECT 1 FROM rsvps 
                WHERE event_id = image_records.entity_id 
                AND user_id = auth.uid()::integer 
                AND status = 'going'
            ))
        )
    );

-- Policy: Admins can see all images
CREATE POLICY "Admins can view all images" ON image_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::integer 
            AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_image_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_image_records_updated_at
    BEFORE UPDATE ON image_records
    FOR EACH ROW
    EXECUTE FUNCTION update_image_records_updated_at();

-- Image Statistics View (for analytics)
CREATE OR REPLACE VIEW image_statistics AS
SELECT 
    image_type,
    entity_type,
    COUNT(*) as total_images,
    COUNT(DISTINCT uploaded_by) as unique_uploaders,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_age_days,
    array_agg(DISTINCT unnest(tags)) as all_tags
FROM image_records 
GROUP BY image_type, entity_type;

-- Function to get user's accessible images with role checking
CREATE OR REPLACE FUNCTION get_user_accessible_images(
    user_id INTEGER,
    image_type_filter VARCHAR DEFAULT NULL,
    entity_type_filter VARCHAR DEFAULT NULL,
    entity_id_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    public_id VARCHAR,
    secure_url TEXT,
    image_type VARCHAR,
    uploaded_by INTEGER,
    entity_id INTEGER,
    entity_type VARCHAR,
    tags TEXT[],
    metadata JSONB,
    access_level VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_role VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ir.id,
        ir.public_id,
        ir.secure_url,
        ir.image_type,
        ir.uploaded_by,
        ir.entity_id,
        ir.entity_type,
        ir.tags,
        ir.metadata,
        ir.access_level,
        ir.created_at,
        ir.updated_at,
        CASE 
            -- User is owner
            WHEN ir.uploaded_by = user_id THEN 'owner'
            -- User is global admin
            WHEN EXISTS (SELECT 1 FROM users WHERE id = user_id AND role = 'admin') THEN 'admin'
            -- User is club leader/admin
            WHEN ir.entity_type = 'club' AND EXISTS (
                SELECT 1 FROM hub_members 
                WHERE hub_id = ir.entity_id 
                AND user_id = get_user_accessible_images.user_id 
                AND role IN ('leader', 'admin')
            ) THEN 'admin'
            -- User is club moderator
            WHEN ir.entity_type = 'club' AND EXISTS (
                SELECT 1 FROM hub_members 
                WHERE hub_id = ir.entity_id 
                AND user_id = get_user_accessible_images.user_id 
                AND role = 'moderator'
            ) THEN 'moderator'
            -- User is club member
            WHEN ir.entity_type = 'club' AND EXISTS (
                SELECT 1 FROM hub_members 
                WHERE hub_id = ir.entity_id 
                AND user_id = get_user_accessible_images.user_id
            ) THEN 'member'
            -- User is event organizer
            WHEN ir.entity_type = 'event' AND EXISTS (
                SELECT 1 FROM events 
                WHERE id = ir.entity_id 
                AND creator_id = get_user_accessible_images.user_id
            ) THEN 'owner'
            -- User is event attendee
            WHEN ir.entity_type = 'event' AND EXISTS (
                SELECT 1 FROM rsvps 
                WHERE event_id = ir.entity_id 
                AND user_id = get_user_accessible_images.user_id 
                AND status = 'going'
            ) THEN 'member'
            -- Public access
            WHEN ir.access_level = 'public' THEN 'public'
            ELSE 'none'
        END as user_role
    FROM image_records ir
    WHERE 
        -- Apply filters
        (image_type_filter IS NULL OR ir.image_type = image_type_filter) AND
        (entity_type_filter IS NULL OR ir.entity_type = entity_type_filter) AND
        (entity_id_filter IS NULL OR ir.entity_id = entity_id_filter) AND
        -- Access control
        (
            ir.uploaded_by = user_id OR -- Owner
            ir.access_level = 'public' OR -- Public
            EXISTS (SELECT 1 FROM users WHERE id = user_id AND role = 'admin') OR -- Global admin
            (ir.access_level = 'member' AND (
                -- Club member access
                (ir.entity_type = 'club' AND EXISTS (
                    SELECT 1 FROM hub_members 
                    WHERE hub_id = ir.entity_id AND user_id = get_user_accessible_images.user_id
                )) OR
                -- Event attendee access
                (ir.entity_type = 'event' AND EXISTS (
                    SELECT 1 FROM rsvps 
                    WHERE event_id = ir.entity_id 
                    AND user_id = get_user_accessible_images.user_id 
                    AND status = 'going'
                ))
            ))
        )
    ORDER BY ir.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform operation on image
CREATE OR REPLACE FUNCTION check_image_access(
    image_id UUID,
    user_id INTEGER,
    operation VARCHAR -- 'view', 'edit', 'delete'
)
RETURNS BOOLEAN AS $$
DECLARE
    image_record RECORD;
    user_role VARCHAR;
    can_access BOOLEAN := FALSE;
BEGIN
    -- Get image record
    SELECT * INTO image_record FROM image_records WHERE id = image_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get user role for this image
    SELECT ur.user_role INTO user_role 
    FROM get_user_accessible_images(user_id, image_record.image_type, image_record.entity_type, image_record.entity_id) ur
    WHERE ur.id = image_id;
    
    -- Check access based on operation and role
    CASE operation
        WHEN 'view' THEN
            can_access := user_role IN ('owner', 'admin', 'moderator', 'member', 'public');
        WHEN 'edit' THEN
            can_access := user_role IN ('owner', 'admin', 'moderator');
        WHEN 'delete' THEN
            can_access := user_role IN ('owner', 'admin');
        ELSE
            can_access := FALSE;
    END CASE;
    
    RETURN can_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for the new functions
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_hub_members_role ON hub_members(hub_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_user ON rsvps(event_id, user_id, status);

-- Comments for documentation
COMMENT ON TABLE image_records IS 'Stores all image metadata with role-based access control';
COMMENT ON COLUMN image_records.public_id IS 'Cloudinary/Supabase public identifier for the image';
COMMENT ON COLUMN image_records.image_type IS 'Type of image determining access rules';
COMMENT ON COLUMN image_records.entity_id IS 'ID of related entity (club, event, etc.)';
COMMENT ON COLUMN image_records.entity_type IS 'Type of related entity';
COMMENT ON COLUMN image_records.access_level IS 'Default access level for the image';
COMMENT ON FUNCTION get_user_accessible_images IS 'Returns all images accessible to a user with their role';
COMMENT ON FUNCTION check_image_access IS 'Checks if user can perform specific operation on image';