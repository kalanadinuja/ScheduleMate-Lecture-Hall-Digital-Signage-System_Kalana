-- Idempotent Migration: Add UI fields for buildings, floors, floor_sides, and lecture_sessions

ALTER TABLE buildings ADD COLUMN IF NOT EXISTS location VARCHAR(150);
ALTER TABLE floors ADD COLUMN IF NOT EXISTS description VARCHAR(255);

ALTER TABLE floor_sides ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active';
ALTER TABLE floor_sides DROP CONSTRAINT IF EXISTS chk_floor_side_status;
ALTER TABLE floor_sides ADD CONSTRAINT chk_floor_side_status CHECK (status IN ('Active', 'Inactive'));

ALTER TABLE lecture_sessions ADD COLUMN IF NOT EXISTS description VARCHAR(255);
