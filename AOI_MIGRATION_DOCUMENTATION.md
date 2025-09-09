# AOI Cart-to-Order Migration Documentation

## Date: 2025-01-09
## Purpose: Document the migration strategy from cart_items to orders for AOI payment processing

---

## 1. Database Schema Analysis

### Current Cart Structure:
```sql
cart_headers:
- id (uuid)
- session_id (text) 
- customer_email (text)
- customer_name (text)
- venue_id (uuid)
- booking_id (uuid) -- links to bookings table

cart_items:
- id (uuid)
- cart_id (uuid) -- FK to cart_headers
- item_id (uuid) -- product or experience ID
- qty (integer)
- booking_id (uuid) -- direct link to bookings
- venue_id (uuid)
```

### Target Order Structure:
```sql
orders:
- id (uuid)
- session_id (text) -- historically used, but AOI uses email
- email (text)
- total (numeric)
- stripe_session_id (text)
- cart_id (uuid) -- link back to original cart

order_items:
- id (uuid)
- order_id (uuid)
- item_id (uuid)
- qty (integer)
- name (text)
- price (numeric)
- pin_code (text) -- NOT NEEDED for AOI
- claimed_at (timestamp) -- AOI: set immediately
- venue_id (uuid)
```

---

## 2. Key Differences: AOI vs WaterBar

### WaterBar Original:
- Uses `session_id` for anonymous customers
- Generates PIN codes for redemption
- Items claimed later with PIN
- Supports bundles with `bundle_components`

### AOI Requirements:
- Uses `customer_email` as primary identifier
- NO PIN generation (experiences tracked in bookings)
- Items marked as claimed immediately
- Must update `bookings` table status to 'paid'
- Simpler flow: booking → cart → payment → order

---

## 3. Migration Options Considered

### Option A: Reuse existing migrate_cart_to_order
**Pros:**
- Already tested and working
- Handles complex scenarios

**Cons:**
- PIN generation logic unnecessary
- Session-based instead of email-based
- Bundle logic not needed for AOI
- Would need significant modifications

### Option B: Create new aoi_migrate_cart_to_order
**Pros:**
- Clean, purpose-built for AOI
- No legacy PIN code logic
- Direct booking status updates
- Simpler to maintain

**Cons:**
- New function to test
- Duplicates some logic

### Option C: Modify existing function with parameters
**Pros:**
- Single function to maintain
- Flexible for both use cases

**Cons:**
- Complex conditional logic
- Risk of breaking existing WaterBar flow
- Harder to understand and debug

**Decision: Option B - Create new AOI-specific function**
- Cleaner separation of concerns
- No risk to existing WaterBar functionality
- Easier to understand and maintain
- Can optimize specifically for AOI workflow

---

## 4. Migration Flow Design

```
1. Stripe Payment Success
   ↓
2. Webhook receives payment confirmation
   ↓
3. Call aoi_migrate_cart_to_order(customer_email, stripe_session_id)
   ↓
4. Function performs:
   a. Find cart_header by customer_email
   b. Create order record
   c. Copy cart_items to order_items (no PINs)
   d. Update bookings.booking_status = 'paid'
   e. Clear cart_items and cart_header
   ↓
5. Return order_id for confirmation
```

---

## 5. Implementation Details

### Key Decisions:
1. **No PIN codes** - Set claimed_at immediately since experiences are pre-scheduled
2. **Email-based lookup** - Use customer_email instead of session_id
3. **Booking status update** - Critical for staff dashboard visibility
4. **Immediate claiming** - No redemption flow needed
5. **Preserve cart_id link** - For audit trail

### Error Handling:
- Cart not found → Return error
- Empty cart → Return error  
- Booking update fails → Log but continue (non-critical)
- Transaction rollback on any critical failure

---

## 6. Testing Strategy

### Test Cases:
1. ✅ Single experience booking with drinks
2. ✅ Multiple cart items (drinks only)
3. ✅ Booking status update verification
4. ✅ Cart cleanup confirmation
5. ✅ Error: Empty cart
6. ✅ Error: Invalid email

---

## 7. Implementation Complete

### Function Created: `aoi_migrate_cart_to_order`

```sql
CREATE OR REPLACE FUNCTION aoi_migrate_cart_to_order(
    p_customer_email TEXT,
    p_stripe_session_id TEXT,
    p_venue_id UUID DEFAULT NULL
) RETURNS UUID
```

### Key Implementation Decisions:

1. **Email-based lookup**: Uses `customer_email` instead of `session_id` for cart identification
2. **Price calculation**: 
   - Experiences: Fetches from `venue_experiences.venue_price`
   - Products: Fetches from `products.price`
3. **No PIN codes**: Completely removed PIN generation logic
4. **Immediate claiming**: Sets `claimed_at = NOW()` for all order items
5. **Booking status update**: Updates recent bookings (last 24 hours) to 'paid'
6. **Cart cleanup**: Deletes cart_items and cart_header after successful migration
7. **Error handling**: Transaction rollback on any failure with error logging

### Function Logic Flow:
1. Find most recent cart for customer_email
2. Calculate total from all cart items
3. Create order record with Stripe session ID
4. Copy cart_items to order_items (no PINs, immediate claim)
5. Update bookings to 'paid' status
6. Clean up cart data
7. Return order_id for confirmation

## 8. Rollback Plan

If issues arise:
1. Function is isolated - can be modified without affecting other systems
2. Original cart data preserved until successful migration
3. Manual SQL available to reverse migration if needed
4. Booking status can be manually corrected if needed

---

## 8. Future Considerations

- Could add user_id support when user accounts are implemented
- May want to add analytics tracking for conversion rates
- Consider adding refund support in future iteration
- Potential for automated receipt generation post-migration
