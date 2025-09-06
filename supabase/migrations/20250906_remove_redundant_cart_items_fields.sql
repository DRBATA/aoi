-- Migration: Remove redundant fields from cart_items
-- booking_status is now authoritative in bookings table via booking_id relationship
-- ai_confidence and recommendation_type are unused (all null values)

-- Drop the redundant columns
ALTER TABLE cart_items 
DROP COLUMN IF EXISTS booking_status,
DROP COLUMN IF EXISTS ai_confidence,
DROP COLUMN IF EXISTS recommendation_type;
