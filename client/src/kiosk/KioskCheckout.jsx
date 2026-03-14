import React, { useState } from 'react';

const API_BASE = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : '';
const TAX_RATE = 0.07;

export default function KioskCheckout({ cart, onBack, onOrderPlaced }) {
  const [name, setName] = useState('');
  const [paymentType, setPaymentType] = useState(null); // 'cash' | 'card'
  const [cardMessage, setCardMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  async function placeOrder(payment) {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/kiosk/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          payment_type: payment,
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      const result = await res.json();
      onOrderPlaced({ ...result, payment_type: payment });
    } catch (e) {
      setError('Something went wrong. Please try again or see the cashier.');
      setLoading(false);
    }
  }

  function handlePayment(type) {
    setPaymentType(type);
    if (type === 'card') {
      setCardMessage(true);
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#FAF7F2',
    }}>
      {/* Header */}
      <div style={{
        background: '#1A1A1A',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '2px solid #FAF7F2',
            borderRadius: 10,
            color: '#FAF7F2',
            padding: '10px 18px',
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: "'Lato', sans-serif",
            minHeight: 48,
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(18px, 3vw, 28px)',
          fontWeight: 700,
          color: '#C9A84C',
          margin: 0,
        }}>
          Review Your Order
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>

          {/* Order Summary */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", margin: '0 0 16px', fontSize: 20 }}>Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #F0EAE0',
              }}>
                <span style={{ fontSize: 16 }}>
                  {item.name} <span style={{ color: '#888' }}>× {item.quantity}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#666' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#666' }}>
                <span>Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, fontSize: 20, borderTop: '2px solid #E8E0D5', marginTop: 6 }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 10, fontSize: 16 }}>
              Your name (for order pickup)
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 20,
                border: '2px solid #E8E0D5',
                borderRadius: 12,
                fontFamily: "'Lato', sans-serif",
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#7C9A7E'}
              onBlur={e => e.target.style.borderColor = '#E8E0D5'}
            />
          </div>

          {/* Payment Method */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, margin: '0 0 16px', fontSize: 16 }}>How would you like to pay?</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => { handlePayment('cash'); }}
                disabled={loading}
                style={{
                  flex: 1,
                  minHeight: 80,
                  background: paymentType === 'cash' ? '#7C9A7E' : '#F0F7F0',
                  color: paymentType === 'cash' ? '#fff' : '#7C9A7E',
                  border: `3px solid ${paymentType === 'cash' ? '#7C9A7E' : '#7C9A7E'}`,
                  borderRadius: 14,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Lato', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                💵 CASH
              </button>
              <button
                onClick={() => handlePayment('card')}
                disabled={loading}
                style={{
                  flex: 1,
                  minHeight: 80,
                  background: paymentType === 'card' ? '#C9A84C' : '#FFF8E7',
                  color: paymentType === 'card' ? '#fff' : '#C9A84C',
                  border: `3px solid #C9A84C`,
                  borderRadius: 14,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Lato', sans-serif",
                  transition: 'all 0.15s',
                }}
              >
                💳 CARD
              </button>
            </div>

            {cardMessage && paymentType === 'card' && (
              <div style={{
                marginTop: 16,
                padding: '14px 18px',
                background: '#FFF8E7',
                border: '2px solid #C9A84C',
                borderRadius: 10,
                color: '#8B6914',
                fontSize: 15,
                fontWeight: 700,
              }}>
                Please see the cashier to complete your card payment after placing your order.
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: '#FFF0F0',
              border: '2px solid #E57373',
              borderRadius: 10,
              padding: '14px 18px',
              color: '#C62828',
              fontSize: 15,
            }}>
              {error}
            </div>
          )}

          {/* Place Order */}
          {paymentType && (
            <button
              onClick={() => placeOrder(paymentType)}
              disabled={loading || !name.trim()}
              style={{
                width: '100%',
                padding: '20px',
                background: loading || !name.trim() ? '#ccc' : '#1A1A1A',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 22,
                fontWeight: 700,
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                fontFamily: "'Lato', sans-serif",
                minHeight: 72,
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
