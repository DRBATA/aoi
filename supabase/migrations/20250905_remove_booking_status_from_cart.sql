-- Remove legacy booking_status field from cart_headers table
-- This field was causing confusion between booking states and cart states

-- First, check if the column exists and remove the constraint if it exists
DO $$ 
BEGIN
    -- Remove check constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cart_headers_booking_status_check' 
        AND table_name = 'cart_headers'
    ) THEN
        ALTER TABLE public.cart_headers DROP CONSTRAINT cart_headers_booking_status_check;
    END IF;
END $$;

-- Drop the booking_status column from cart_headers
ALTER TABLE public.cart_headers 
DROP COLUMN IF EXISTS booking_status;

-- Add proper cart_status field if it doesn't exist
ALTER TABLE public.cart_headers 
ADD COLUMN IF NOT EXISTS cart_status text DEFAULT 'active' 
CHECK (cart_status IN ('active', 'paid', 'cancelled', 'expired'));

-- Add index for performance when filtering by cart_status
CREATE INDEX IF NOT EXISTS idx_cart_headers_cart_status ON public.cart_headers(cart_status);

-- Add comment to explain the field usage
COMMENT ON COLUMN public.cart_headers.cart_status IS 'Status of the cart: active (can add items), paid (completed order), cancelled, expired';
