import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Format date for booking confirmations
function formatBookingDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

// Function to send booking confirmation email
export async function sendBookingConfirmationEmail(
  email: string,
  customerName: string,
  bookingDetails: {
    id: string;
    venueName: string;
    experienceName: string;
    slotTime: string;
    durationMinutes: number;
    price: number;
  }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AOI Bookings <bookings@aoi.thewater.bar>',
      to: [email],
      subject: `Booking Confirmed: ${bookingDetails.experienceName} at ${bookingDetails.venueName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; color: #333333; line-height: 1.5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { margin-bottom: 30px; text-align: center; }
              .booking-card { background-color: #f9f9f9; border: 1px solid #e2e2e2; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .booking-detail { margin: 10px 0; }
              .booking-detail strong { color: #111827; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999999; }
              .important { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; color: #111827;">Booking Confirmed</h1>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Booking #${bookingDetails.id.substring(0, 8)}</p>
              </div>
              
              <p>Dear ${customerName || 'Valued Guest'},</p>
              <p>Your booking has been confirmed! Please save this email for your records.</p>
              
              <div class="booking-card">
                <h2 style="margin: 0 0 15px 0; color: #111827;">Booking Details</h2>
                <div class="booking-detail">
                  <strong>Experience:</strong> ${bookingDetails.experienceName}
                </div>
                <div class="booking-detail">
                  <strong>Venue:</strong> ${bookingDetails.venueName}
                </div>
                <div class="booking-detail">
                  <strong>Date & Time:</strong> ${formatBookingDate(bookingDetails.slotTime)}
                </div>
                <div class="booking-detail">
                  <strong>Duration:</strong> ${bookingDetails.durationMinutes} minutes
                </div>
                <div class="booking-detail">
                  <strong>Price:</strong> ${bookingDetails.price} AED
                </div>
              </div>
              
              <div class="important">
                <p style="margin: 0; font-weight: 600;">Important Reminders:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Please arrive 10 minutes before your scheduled time</li>
                  <li>Bring a valid ID for verification</li>
                  <li>Contact us if you need to reschedule or cancel</li>
                </ul>
              </div>
              
              <p>We look forward to welcoming you!</p>
              
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Art of Implosion. All rights reserved.</p>
                <p>Need help? Contact us at support@aoi.thewater.bar</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error };
  }
}
