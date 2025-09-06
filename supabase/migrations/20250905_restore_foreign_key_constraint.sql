-- Migration: Restore foreign key constraint for data integrity
-- Put back the constraint while we think through the proper solution

-- Add foreign key constraint from cart_items.item_id to products.id
ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES products(id);

-- Add comment explaining restoration
COMMENT ON COLUMN cart_items.item_id IS 'Foreign key reference to products.id - constraint restored for data integrity';
