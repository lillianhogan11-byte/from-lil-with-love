import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../api.js';

export default function KioskMenu({ cart, onAddToCart, onUpdateQuantity, onCheckout }) {
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    apiFetch('/api/menu')
      .then(data => {
        setMenuData(data);
        const cats = Object.keys(data);
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function update() {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const activeItems = menuData[activeCategory] || [];

  function getQty(itemId) {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FAF7F2', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        background: '#1A1A1A',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: 700,
            color: '#C9A84C',
            margin: 0,
            lineHeight: 1,
          }}>
            The Biscuit Bar
          </h1>
          <p style={{ color: '#FAF7F2', margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>Franklin, Indiana</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#FAF7F2', fontSize: 'clamp(16px, 2.5vw, 24px)', fontWeight: 700 }}>{currentTime}</div>
          <div style={{ color: '#C9A84C', fontSize: 12, opacity: 0.8 }}>Order Here</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        background: '#fff',
        borderBottom: '2px solid #E8E0D5',
        overflowX: 'auto',
        flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        <div style={{ display: 'flex', padding: '0 16px', gap: 4, minWidth: 'max-content' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeCategory === cat ? '3px solid #7C9A7E' : '3px solid transparent',
                color: activeCategory === cat ? '#7C9A7E' : '#888',
                fontFamily: "'Lato', sans-serif",
                fontSize: 15,
                fontWeight: activeCategory === cat ? 700 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        paddingBottom: itemCount > 0 ? '100px' : '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {activeItems.map(item => {
            const qty = getQty(item.id);
            return (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: qty > 0 ? '2px solid #7C9A7E' : '2px solid transparent',
                  transition: 'border-color 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {item.image_url && (
                  <div style={{ height: 160, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 18,
                    fontWeight: 600,
                    margin: '0 0 6px',
                    color: '#1A1A1A',
                  }}>
                    {item.name}
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: '#666',
                    margin: '0 0 12px',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>
                      ${Number(item.price).toFixed(2)}
                    </span>
                    {qty === 0 ? (
                      <button
                        onClick={() => onAddToCart(item)}
                        style={{
                          minWidth: 64,
                          minHeight: 64,
                          padding: '0 20px',
                          background: '#7C9A7E',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 12,
                          fontSize: 28,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          style={{
                            width: 40,
                            height: 40,
                            background: '#F0F0F0',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1A1A1A',
                          }}
                        >
                          −
                        </button>
                        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                        <button
                          onClick={() => onAddToCart(item)}
                          style={{
                            width: 40,
                            height: 40,
                            background: '#7C9A7E',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      {itemCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#1A1A1A',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => setShowCart(true)}
              style={{
                background: '#333',
                border: 'none',
                borderRadius: 10,
                padding: '10px 16px',
                color: '#FAF7F2',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: "'Lato', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{
                background: '#7C9A7E',
                color: '#fff',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
              }}>
                {itemCount}
              </span>
              View Cart
            </button>
            <span style={{ color: '#FAF7F2', fontSize: 16 }}>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong>
            </span>
          </div>
          <button
            onClick={onCheckout}
            style={{
              background: '#C9A84C',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: 12,
              padding: '16px 28px',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              minHeight: 64,
            }}
          >
            Review Order →
          </button>
        </div>
      )}

      {/* Cart Slide-Up Panel */}
      {showCart && (
        <div
          onClick={() => setShowCart(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FAF7F2',
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", margin: 0, fontSize: 22 }}>Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666' }}
              >
                ×
              </button>
            </div>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #E8E0D5',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
                  <div style={{ color: '#666', fontSize: 14 }}>${Number(item.price).toFixed(2)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: '#E8E0D5', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    −
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => onAddToCart(item)}
                    style={{ width: 40, height: 40, borderRadius: 8, border: 'none', background: '#7C9A7E', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    +
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 16, minWidth: 60, textAlign: 'right' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 700, fontSize: 18 }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setShowCart(false); onCheckout(); }}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '18px',
                background: '#C9A84C',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Lato', sans-serif",
                minHeight: 64,
              }}
            >
              Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
