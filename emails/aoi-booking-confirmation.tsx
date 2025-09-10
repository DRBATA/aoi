import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column
} from '@react-email/components';

interface DrinkItem {
  name: string;
  description?: string;
  price?: number;
  timing?: string;
}

interface AOIBookingConfirmationEmailProps {
  customerName: string;
  bookingId: string;
  experienceName: string;
  slotTime: string;
  durationMinutes: number;
  venueName: string;
  preflightMenu?: {
    preDrinks?: DrinkItem[];
    duringDrinks?: DrinkItem[];
    afterDrinks?: DrinkItem[];
  };
}

export const AOIBookingConfirmationEmail = ({
  customerName,
  bookingId,
  experienceName,
  slotTime,
  durationMinutes,
  venueName,
  preflightMenu = {}
}: AOIBookingConfirmationEmailProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Html>
      <Head />
      <Preview>Your {experienceName} is confirmed at {venueName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✨ Your AOI Experience is Confirmed!</Heading>
          
          <Text style={text}>Dear {customerName},</Text>
          
          <Text style={text}>
            Your transformative wellness journey has been reserved. We're excited to guide you through your personalized experience.
          </Text>

          <Section style={bookingDetailsSection}>
            <Heading as="h2" style={h2}>Booking Details</Heading>
            <Hr style={hr} />
            
            <Row>
              <Column style={detailLabel}>Experience:</Column>
              <Column style={detailValue}>{experienceName}</Column>
            </Row>
            <Row>
              <Column style={detailLabel}>Date:</Column>
              <Column style={detailValue}>{formatDate(slotTime)}</Column>
            </Row>
            <Row>
              <Column style={detailLabel}>Time:</Column>
              <Column style={detailValue}>{formatTime(slotTime)}</Column>
            </Row>
            <Row>
              <Column style={detailLabel}>Duration:</Column>
              <Column style={detailValue}>{durationMinutes} minutes</Column>
            </Row>
            <Row>
              <Column style={detailLabel}>Location:</Column>
              <Column style={detailValue}>{venueName}</Column>
            </Row>
            <Row>
              <Column style={detailLabel}>Booking ID:</Column>
              <Column style={detailValue}>{bookingId.substring(0, 8).toUpperCase()}</Column>
            </Row>
          </Section>

          {(preflightMenu.preDrinks?.length || 
            preflightMenu.duringDrinks?.length || 
            preflightMenu.afterDrinks?.length) && (
            <Section style={preflightSection}>
              <Heading as="h2" style={h2}>🍃 Your Preflight Menu</Heading>
              <Text style={text}>
                Our expert staff will offer these scientifically-curated drinks at optimal moments during your journey:
              </Text>
              
              {preflightMenu.preDrinks && preflightMenu.preDrinks.length > 0 && (
                <>
                  <Heading as="h3" style={h3}>Before Your Session</Heading>
                  <Text style={smallText}>Prepare your body and mind for the experience ahead</Text>
                  {preflightMenu.preDrinks.map((drink, idx) => (
                    <div key={idx} style={drinkItem}>
                      <Text style={drinkName}>{drink.name}</Text>
                      {drink.description && (
                        <Text style={drinkDescription}>{drink.description}</Text>
                      )}
                    </div>
                  ))}
                </>
              )}

              {preflightMenu.duringDrinks && preflightMenu.duringDrinks.length > 0 && (
                <>
                  <Heading as="h3" style={h3}>During Your Session</Heading>
                  <Text style={smallText}>Enhance and amplify your experience</Text>
                  {preflightMenu.duringDrinks.map((drink, idx) => (
                    <div key={idx} style={drinkItem}>
                      <Text style={drinkName}>{drink.name}</Text>
                      {drink.description && (
                        <Text style={drinkDescription}>{drink.description}</Text>
                      )}
                    </div>
                  ))}
                </>
              )}

              {preflightMenu.afterDrinks && preflightMenu.afterDrinks.length > 0 && (
                <>
                  <Heading as="h3" style={h3}>After Your Session</Heading>
                  <Text style={smallText}>Integrate and extend the benefits</Text>
                  {preflightMenu.afterDrinks.map((drink, idx) => (
                    <div key={idx} style={drinkItem}>
                      <Text style={drinkName}>{drink.name}</Text>
                      {drink.description && (
                        <Text style={drinkDescription}>{drink.description}</Text>
                      )}
                    </div>
                  ))}
                </>
              )}
            </Section>
          )}

          <Section style={preparationSection}>
            <Heading as="h2" style={h2}>How to Prepare</Heading>
            <Text style={text}>
              • Arrive 10 minutes early to complete check-in<br/>
              • Wear comfortable clothing<br/>
              • Avoid heavy meals 2 hours before<br/>
              • Stay hydrated throughout the day<br/>
              • Bring an open mind and readiness to transform
            </Text>
          </Section>

          <Text style={footer}>
            If you need to modify or cancel your booking, please contact us at least 24 hours in advance.
          </Text>
          
          <Text style={footer}>
            We look forward to guiding you on your wellness journey.
          </Text>
          
          <Text style={signature}>
            With wellness and light,<br/>
            The AOI Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const h3 = {
  color: '#4338ca',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '20px 0 8px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  padding: '0 48px',
};

const smallText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
  padding: '0 48px',
};

const bookingDetailsSection = {
  padding: '24px 48px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '24px 48px',
};

const preflightSection = {
  padding: '24px 48px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '24px 48px',
};

const preparationSection = {
  padding: '24px 48px',
  backgroundColor: '#e0e7ff',
  borderRadius: '8px',
  margin: '24px 48px',
};

const detailLabel = {
  color: '#737373',
  fontSize: '14px',
  padding: '4px 0',
  width: '120px',
};

const detailValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '500',
  padding: '4px 0',
};

const drinkItem = {
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  margin: '8px 0',
};

const drinkName = {
  color: '#1a1a1a',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const drinkDescription = {
  color: '#525252',
  fontSize: '13px',
  lineHeight: '18px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const footer = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 48px',
  textAlign: 'center' as const,
};

const signature = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
  padding: '0 48px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};

export default AOIBookingConfirmationEmail;
