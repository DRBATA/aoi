-- Migration: Clean up orphaned cart_items before adding foreign key constraint
-- Remove cart_items that reference non-existent products

-- First, let's see what we're dealing with
-- DELETE cart_items that have item_id values not present in products table
DELETE FROM cart_items 
WHERE item_id NOT IN (SELECT id FROM products);

-- Add a comment about the cleanup
COMMENT ON TABLE cart_items IS 'Cart items table - cleaned up orphaned references on 2025-09-05';
