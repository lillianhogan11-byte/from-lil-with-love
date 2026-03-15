import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2 } },
});

const KioskApp = lazy(() => import('./kiosk/KioskApp.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <KioskApp />
      </Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);
