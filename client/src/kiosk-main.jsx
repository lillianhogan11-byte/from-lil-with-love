import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';

const KioskApp = lazy(() => import('./kiosk/KioskApp.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <KioskApp />
    </Suspense>
  </React.StrictMode>
);
