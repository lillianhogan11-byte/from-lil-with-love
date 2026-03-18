import React, { useState } from 'react';
import { apiFetch } from '../api.js';

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
      const result = await apiFetch('/api/kiosk/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: name.trim(),
          payment_type: payment,
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
        }),
      });
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
      background: '#F2EDE4',
    }}>
      {/* Header */}
      <div style={{
        background: '#1A0F0A',
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
            border: '2px solid #F2EDE4',
            borderRadius: 10,
            color: '#F2EDE4',
            padding: '10px 18px',
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'Georgia, serif',
            minHeight: 48,
          }}
        >
          ← Back
        </button>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(18px, 3vw, 28px)',
          fontWeight: 700,
          color: '#F2EDE4',
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
            <h2 style={{ fontFamily: 'Georgia, serif', margin: '0 0 16px', fontSize: 20, color: '#1A0F0A' }}>Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #EDE8DF',
              }}>
                <span style={{ fontSize: 16, color: '#1A0F0A' }}>
                  {item.name} <span style={{ color: '#B8A99A' }}>× {item.quantity}</span>
                </span>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#1A0F0A' }}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#B8A99A' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#B8A99A' }}>
                <span>Tax (7%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 700, fontSize: 20, borderTop: '2px solid #EDE8DF', marginTop: 6, color: '#1A0F0A' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 10, fontSize: 16, color: '#1A0F0A' }}>
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
                border: '2px solid #EDE8DF',
                borderRadius: 12,
                fontFamily: 'Georgia, serif',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#1A0F0A',
              }}
              onFocus={e => e.target.style.borderColor = '#5C6E54'}
              onBlur={e => e.target.style.borderColor = '#EDE8DF'}
            />
          </div>

          {/* Payment Method */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 700, margin: '0 0 16px', fontSize: 16, color: '#1A0F0A' }}>How would you like to pay?</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => { handlePayment('cash'); }}
                disabled={loading}
                style={{
                  flex: 1,
                  minHeight: 80,
                  background: paymentType === 'cash' ? '#5C6E54' : '#EDF2EA',
                  color: paymentType === 'cash' ? '#fff' : '#5C6E54',
                  border: `3px solid #5C6E54`,
                  borderRadius: 14,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Georgia, serif',
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
                  background: paymentType === 'card' ? '#6E2035' : '#F5EEF0',
                  color: paymentType === 'card' ? '#fff' : '#6E2035',
                  border: `3px solid #6E2035`,
                  borderRadius: 14,
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Georgia, serif',
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
                background: '#F5EEF0',
                border: '2px solid #6E2035',
                borderRadius: 10,
                color: '#6E2035',
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
                background: loading || !name.trim() ? '#B8A99A' : '#6E2035',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                fontSize: 22,
                fontWeight: 700,
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif',
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
