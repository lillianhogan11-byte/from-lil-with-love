import React, { useEffect, useState } from 'react';

export default function KioskConfirmation({ order, onReset }) {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onReset]);

  const isCard = order?.payment_type === 'card';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAF7F2',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      {/* Checkmark */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: '#7C9A7E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        boxShadow: '0 8px 32px rgba(124,154,126,0.3)',
      }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M12 30L25 43L48 17" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 700,
        color: '#1A1A1A',
        margin: '0 0 8px',
      }}>
        Order #{order?.id} received!
      </h1>

      <p style={{ fontSize: 24, color: '#7C9A7E', fontWeight: 700, margin: '0 0 8px' }}>
        ${Number(order?.total).toFixed(2)}
      </p>

      <p style={{ fontSize: 20, color: '#1A1A1A', margin: '0 0 24px' }}>
        Thank you, {order?.customer_name}!
      </p>

      <div style={{
        background: isCard ? '#FFF8E7' : '#F0F7F0',
        border: `2px solid ${isCard ? '#C9A84C' : '#7C9A7E'}`,
        borderRadius: 16,
        padding: '20px 32px',
        marginBottom: 40,
        maxWidth: 480,
        width: '100%',
      }}>
        {isCard ? (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#C9A84C', margin: '0 0 8px' }}>
              Card Payment
            </p>
            <p style={{ fontSize: 16, color: '#1A1A1A', margin: 0 }}>
              Please see the cashier to complete your payment of ${Number(order?.total).toFixed(2)}.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#7C9A7E', margin: '0 0 8px' }}>
              Cash Payment
            </p>
            <p style={{ fontSize: 16, color: '#1A1A1A', margin: 0 }}>
              Please pay <strong>${Number(order?.total).toFixed(2)}</strong> at the counter.
            </p>
          </>
        )}
      </div>

      <p style={{ fontSize: 15, color: '#888', margin: 0 }}>
        Returning to menu in {countdown} second{countdown !== 1 ? 's' : ''}...
      </p>

      <button
        onClick={onReset}
        style={{
          marginTop: 24,
          padding: '16px 40px',
          background: 'transparent',
          border: '2px solid #C9A84C',
          borderRadius: 12,
          color: '#C9A84C',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Lato', sans-serif",
        }}
      >
        Start New Order
      </button>
    </div>
  );
}
