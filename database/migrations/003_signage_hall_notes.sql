-- Idempotent Migration 003: Add status_note and status_until to lecture_halls for signage display maintenance notes

ALTER TABLE lecture_halls ADD COLUMN IF NOT EXISTS status_note VARCHAR(255);
ALTER TABLE lecture_halls ADD COLUMN IF NOT EXISTS status_until TIME;
