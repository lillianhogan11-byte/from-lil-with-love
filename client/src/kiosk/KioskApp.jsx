import React, { useState } from 'react';
import KioskMenu from './KioskMenu.jsx';
import KioskCheckout from './KioskCheckout.jsx';
import KioskConfirmation from './KioskConfirmation.jsx';

export default function KioskApp() {
  const [screen, setScreen] = useState('browse'); // 'browse' | 'checkout' | 'confirmation'
  const [cart, setCart] = useState([]);
  const [orderResult, setOrderResult] = useState(null);

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(itemId, delta) {
    setCart(prev => {
      const updated = prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i)
                         .filter(i => i.quantity > 0);
      return updated;
    });
  }

  function handleOrderPlaced(result) {
    setOrderResult(result);
    setScreen('confirmation');
  }

  function handleReset() {
    setCart([]);
    setOrderResult(null);
    setScreen('browse');
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#FAF7F2', display: 'flex', flexDirection: 'column' }}>
      {screen === 'browse' && (
        <KioskMenu
          cart={cart}
          onAddToCart={addToCart}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => setScreen('checkout')}
        />
      )}
      {screen === 'checkout' && (
        <KioskCheckout
          cart={cart}
          onBack={() => setScreen('browse')}
          onOrderPlaced={handleOrderPlaced}
        />
      )}
      {screen === 'confirmation' && (
        <KioskConfirmation
          order={orderResult}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
