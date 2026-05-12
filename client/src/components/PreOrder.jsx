import React from 'react';

const SAGE = '#7C9A7E';
const BURGUNDY = '#6E2035';
const BG = '#FAF7F2';

const HOTPLATE_URL = 'https://www.hotplate.com/biscuitbar';

export default function PreOrder() {
  return (
    <section id="preorder" style={{ background: BG, padding: '80px 24px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontFamily: "'Lato', sans-serif", fontSize: '12px',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: SAGE, marginBottom: '10px'
          }}>
            Skip the line
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '36px', fontWeight: '700', color: '#2a1a10', margin: '0 0 12px'
          }}>
            Pre-Order
          </h2>
          <p style={{
            fontFamily: "'Lato', sans-serif", color: '#7a6a5a',
            fontSize: '16px', lineHeight: 1.6
          }}>
            Reserve your biscuits before market day. Pick up Saturday morning.
          </p>
          <div style={{ width: '40px', height: '2px', background: SAGE, margin: '20px auto 0' }} />
        </div>

        {/* Hot Plate embed */}
        <div style={{
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #e8e0d4',
          boxShadow: '0 2px 16px rgba(42,26,16,0.06)',
          minHeight: '700px',
        }}>
          <iframe
            src={HOTPLATE_URL}
            title="Pre-order from From Lil With Love on Hot Plate"
            width="100%"
            height="750"
            style={{ border: 'none', display: 'block' }}
            allow="payment"
            loading="lazy"
          />
        </div>

        {/* Fallback link */}
        <p style={{
          textAlign: 'center', marginTop: '16px',
          fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#9a8a7a'
        }}>
          Having trouble?{' '}
          <a
            href={HOTPLATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: BURGUNDY, textDecoration: 'underline' }}
          >
            Open in a new tab
          </a>
        </p>

      </div>
    </section>
  );
}
