-- Add item_type column to cart_items table to distinguish bookings from products
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS item_type text DEFAULT 'product' 
CHECK (item_type IN ('product', 'booking', 'service'));

-- Add index for performance when filtering by item_type
CREATE INDEX IF NOT EXISTS idx_cart_items_item_type ON public.cart_items(item_type);

-- Add composite index for common queries (venue_id, item_type, created_at)
CREATE INDEX IF NOT EXISTS idx_cart_items_venue_type_date 
ON public.cart_items(venue_id, item_type, created_at);

-- Update existing cart items to have correct item_type based on product category
-- This assumes products with certain patterns are bookings
UPDATE public.cart_items ci
SET item_type = CASE 
    WHEN p.name ILIKE '%therapy%' OR p.name ILIKE '%session%' OR p.name ILIKE '%treatment%' 
    THEN 'booking'
    WHEN p.name ILIKE '%service%' OR p.name ILIKE '%consultation%'
    THEN 'service'
    ELSE 'product'
END
FROM public.products p
WHERE ci.product_id = p.id 
AND ci.item_type = 'product'; -- Only update items that haven't been categorized yet

-- Add booking_metadata column to store booking-specific details
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS booking_metadata jsonb;

-- Add comment to explain the field usage
COMMENT ON COLUMN public.cart_items.item_type IS 'Type of cart item: product (drinks/merchandise), booking (time slot reservations), service (add-on services)';
COMMENT ON COLUMN public.cart_items.booking_metadata IS 'Stores booking-specific data like time slot, room, therapist, duration, special requests';
