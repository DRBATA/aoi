-- Migration: Add cart_id to orders table for direct cart-order linking
-- This replaces the session_id linking approach with a cleaner cart_id reference

-- Add cart_id column to orders table
ALTER TABLE orders 
ADD COLUMN cart_id uuid REFERENCES cart_headers(id);

-- Create index for performance on cart_id lookups
CREATE INDEX idx_orders_cart_id ON orders(cart_id);

-- Add comment explaining the new linking approach
COMMENT ON COLUMN orders.cart_id IS 'Direct reference to cart_headers.id for linking orders to their originating cart';

-- Note: session_id column is preserved for historical data but will not be used going forward
COMMENT ON COLUMN orders.session_id IS 'Legacy field preserved for historical cart-order links. New orders use cart_id instead.';
