'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode } from "lucide-react";
import Image from "next/image";

interface PaymentButtonProps {
  customerEmail: string;
}

export default function PaymentButton({ customerEmail }: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const generatePaymentLink = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/aoi-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: customerEmail })
      });

      const data = await response.json();
      
      if (data.url) {
        setPaymentUrl(data.url);
        setShowQR(true);
      } else {
        alert(data.error || 'Failed to generate payment link');
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      alert('Error generating payment link');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = (url: string) => {
    // Simple QR code generation using Google Charts API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    return qrUrl;
  };

  return (
    <>
      <Button
        onClick={generatePaymentLink}
        disabled={isLoading}
        className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 flex items-center gap-1"
      >
        <CreditCard className="w-3 h-3" />
        {isLoading ? 'Loading...' : 'Pay'}
      </Button>

      {/* QR Code Modal */}
      {showQR && paymentUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <QrCode className="w-8 h-8 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-bold mb-4">Payment QR Code</h3>
              <p className="text-gray-600 mb-6">Customer can scan this code to pay</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <Image 
                  src={generateQRCode(paymentUrl)} 
                  alt="Payment QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.open(paymentUrl, '_blank')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Open Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
