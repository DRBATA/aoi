import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { cartItemId, status } = await req.json();
    
    if (!cartItemId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status transition
    const validStatuses = ['booked', 'arrived', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Update booking status
    const { data, error } = await supabase
      .from('cart_items')
      .update({ 
        booking_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    // If marking as completed and there's an AI recommendation, 
    // it stays in the cart history but won't be editable
    if (status === 'completed' && data.ai_recommendation) {
      console.log('Booking completed with AI recommendation:', data.ai_recommendation);
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    console.error('Error in booking status update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
