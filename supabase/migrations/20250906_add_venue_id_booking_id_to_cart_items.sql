-- Migration: Add venue_id and booking_id to cart_items
-- This enables venue-specific experience pricing and duplicate booking prevention

-- Add venue_id column for venue context (null for products, populated for experiences)
ALTER TABLE cart_items 
ADD COLUMN venue_id uuid;

-- Add booking_id column for duplicate prevention and booking reference
ALTER TABLE cart_items 
ADD COLUMN booking_id uuid;

-- Create index for performance on venue_id lookups (used in venue_experiences joins)
CREATE INDEX IF NOT EXISTS idx_cart_items_venue_id ON cart_items(venue_id);

-- Create index for booking_id lookups (used for duplicate prevention)
CREATE INDEX IF NOT EXISTS idx_cart_items_booking_id ON cart_items(booking_id);

-- Add comments explaining the new columns
COMMENT ON COLUMN cart_items.venue_id IS 'Venue reference for experiences (null for products). Used with item_id to lookup venue_experiences for pricing.';
COMMENT ON COLUMN cart_items.booking_id IS 'Reference to booking that created this cart item. Used for duplicate prevention and linking.';
