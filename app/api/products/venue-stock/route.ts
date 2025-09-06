import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { venueName } = await request.json();
    
    if (!venueName) {
      return NextResponse.json({ error: 'Venue name is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get products for the venue
    const { data: products, error } = await supabase
      .from('venue_products')
      .select(`
        product_id,
        stock_quantity,
        venue_price,
        products!inner(
          id,
          name,
          description,
          tags,
          category,
          base_price
        )
      `)
      .eq('venue_name', venueName)
      .gt('stock_quantity', 0);

    if (error) {
      console.error('Error fetching venue products:', error);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    // Format products for frontend
    const formattedProducts = products?.map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        tags: product.tags,
        category: product.category,
        base_price: product.base_price,
        venue_price: item.venue_price,
        stock_quantity: item.stock_quantity
      };
    }) || [];

    return NextResponse.json({ 
      products: formattedProducts,
      count: formattedProducts.length 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
