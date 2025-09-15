import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Hard-code AOI venue name since this is AOI-specific API
    const venueName = 'Art of Implosion x Johny Dar Experience';

    const supabase = await createClient();

    // Get products with venue stock using the correct table structure
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id, 
        name, 
        description, 
        price_aed, 
        image_url,
        faqs,
        tags, 
        category,
        venue_stock(
          qty_on_hand, 
          venue:venue_id(id, name, from_date, to_date)
        )
      `);

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    const currentDateStr = new Date().toISOString().split('T')[0];

    // Filter and format products for the specific venue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedProducts = products?.map((product: any) => {
      // Find venue stock for the requested venue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const venueStock = product.venue_stock?.find((vs: any) => 
        vs.venue?.name === venueName &&
        vs.qty_on_hand > 0 &&
        (!vs.venue.from_date || vs.venue.from_date <= currentDateStr) &&
        (!vs.venue.to_date || vs.venue.to_date >= currentDateStr)
      );

      if (!venueStock) return null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        tags: product.tags,
        category: product.category,
        price: product.price_aed,
        qty_on_hand: venueStock.qty_on_hand,
        image: product.image_url,
        faqs: product.faqs
      };
    }).filter(Boolean) || [];

    return NextResponse.json({ 
      products: formattedProducts,
      count: formattedProducts.length 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
