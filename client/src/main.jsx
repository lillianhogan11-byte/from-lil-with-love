import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { CartProvider } from './context/CartContext';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 2 } },
});

const theme = extendTheme({
  colors: {
    brand: {
      black: '#1A1A1A',
      sage: '#7C9A7E',
      gray: '#F2F2F0',
      cream: '#FAF7F2',
      gold: '#C9A84C',
    },
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Lato', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: '#FAF7F2',
        color: '#1A1A1A',
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: '#7C9A7E',
          color: 'white',
          _hover: { bg: '#6a897c', transform: 'translateY(-1px)', boxShadow: 'md' },
          transition: 'all 0.2s',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
