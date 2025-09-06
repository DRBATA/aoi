-- Migration: Add foreign key constraint between cart_items and products
-- This fixes the "Could not find a relationship between 'cart_items' and 'products'" error

-- Add foreign key constraint from cart_items.item_id to products.id
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES products(id);

-- Create index for performance on item_id lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_item_id ON cart_items(item_id);

-- Add comment explaining the relationship
COMMENT ON COLUMN cart_items.item_id IS 'Foreign key reference to products.id for product information';
