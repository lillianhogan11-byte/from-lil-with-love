import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const SAGE = '#7C9A7E';
const BURGUNDY = '#6E2035';
const BG = '#FAF7F2';
const LIGHT_BG = '#F2EDE4';

export default function PreOrder() {
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketDate, setMarketDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    apiFetch('/api/menu')
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || []);
        setMenuItems(items.filter(i => i.available !== false));
      })
      .catch(() => {});
  }, []);

  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const setQty = (id, val) => {
    setQuantities(q => ({ ...q, [id]: Math.max(0, Math.min(12, Number(val))) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!marketDate) { setError('Market date is required.'); return; }
    const selectedItems = menuItems
      .filter(i => (quantities[i.id] || 0) > 0)
      .map(i => ({ id: i.id, name: i.name, quantity: quantities[i.id] }));
    if (selectedItems.length === 0) { setError('Please select at least one item.'); return; }

    setLoading(true);
    try {
      await apiFetch('/api/preorders', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          market_date: marketDate,
          items: JSON.stringify(selectedItems),
          notes: notes.trim() || undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section style={{ background: BG, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🥐</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', color: BURGUNDY, marginBottom: '12px' }}>
            You're on the list!
          </h2>
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#5a4a3a', lineHeight: 1.7, fontSize: '16px' }}>
            Your order is reserved! We'll confirm via email or text before market day.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="preorder" style={{ background: BG, padding: '80px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: SAGE, marginBottom: '10px' }}>
            Skip the line
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: '700', color: '#2a1a10', margin: '0 0 12px' }}>
            Pre-Order for Market
          </h2>
          <p style={{ fontFamily: "'Lato', sans-serif", color: '#7a6a5a', fontSize: '16px', lineHeight: 1.6 }}>
            Reserve your biscuits before market day. Pick up Saturday morning.
          </p>
          <div style={{ width: '40px', height: '2px', background: SAGE, margin: '20px auto 0' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Menu items */}
          {Object.keys(grouped).length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2a1a10', marginBottom: '20px' }}>
                Choose Your Biscuits
              </h3>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom: '24px' }}>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: SAGE, marginBottom: '10px' }}>
                    {cat}
                  </p>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', background: LIGHT_BG, borderRadius: '2px', marginBottom: '8px'
                    }}>
                      <div>
                        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '15px', color: '#2a1a10', margin: 0, fontWeight: '600' }}>{item.name}</p>
                        {item.price != null && (
                          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#8a7a6a', margin: '2px 0 0' }}>
                            ${Number(item.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0" max="12"
                        value={quantities[item.id] || 0}
                        onChange={e => setQty(item.id, e.target.value)}
                        style={{
                          width: '64px', textAlign: 'center', padding: '6px 8px',
                          border: `1px solid ${(quantities[item.id] || 0) > 0 ? SAGE : '#d8cfc6'}`,
                          borderRadius: '2px', fontFamily: "'Lato', sans-serif", fontSize: '15px',
                          background: 'white', color: '#2a1a10', outline: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Contact info */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#2a1a10', marginBottom: '20px' }}>
              Your Details
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { label: 'Name', value: name, setter: setName, required: true, placeholder: 'Your full name' },
                { label: 'Email', value: email, setter: setEmail, required: false, placeholder: 'Optional — for confirmation' },
                { label: 'Phone', value: phone, setter: setPhone, required: false, placeholder: 'Optional — for confirmation' },
              ].map(({ label, value, setter, required, placeholder }) => (
                <div key={label}>
                  <label style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a6a', display: 'block', marginBottom: '6px' }}>
                    {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
                  </label>
                  <input
                    type={label === 'Email' ? 'email' : 'text'}
                    value={value}
                    onChange={e => setter(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #d8cfc6',
                      borderRadius: '2px', fontFamily: "'Lato', sans-serif", fontSize: '15px',
                      background: 'white', color: '#2a1a10', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}

              {/* Market Date */}
              <div>
                <label style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a6a', display: 'block', marginBottom: '6px' }}>
                  Market Date <span style={{ color: BURGUNDY }}>*</span>
                </label>
                <input
                  type="date"
                  value={marketDate}
                  min={today}
                  onChange={e => setMarketDate(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #d8cfc6',
                    borderRadius: '2px', fontFamily: "'Lato', sans-serif", fontSize: '15px',
                    background: 'white', color: '#2a1a10', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7a6a', display: 'block', marginBottom: '6px' }}>
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Allergies, special requests, anything else..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #d8cfc6',
                    borderRadius: '2px', fontFamily: "'Lato', sans-serif", fontSize: '15px',
                    background: 'white', color: '#2a1a10', outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: "'Lato', sans-serif", color: BURGUNDY, marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 24px', background: loading ? '#a0566a' : BURGUNDY,
              color: 'white', border: 'none', borderRadius: '2px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Lato', sans-serif", fontSize: '14px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: '600', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Reserving...' : 'Reserve My Order'}
          </button>
        </form>
      </div>
    </section>
  );
}
