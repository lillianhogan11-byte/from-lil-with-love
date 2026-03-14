import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, Center, Spinner } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PortalRoute from './portal/PortalRoute';
import Login from './portal/Login';
import AuthCallback from './portal/AuthCallback';
const Dashboard = lazy(() => import('./portal/Dashboard'));
const Orders = lazy(() => import('./portal/Orders'));
const CustomOrders = lazy(() => import('./portal/CustomOrders'));
const Income = lazy(() => import('./portal/Income'));
const Expenses = lazy(() => import('./portal/Expenses'));
const Recipes = lazy(() => import('./portal/Recipes'));
const Inventory = lazy(() => import('./portal/Inventory'));
const Events = lazy(() => import('./portal/Events'));
const Mileage = lazy(() => import('./portal/Mileage'));
const Suppliers = lazy(() => import('./portal/Suppliers'));
const MenuManager = lazy(() => import('./portal/MenuManager'));
const TaxExport = lazy(() => import('./portal/TaxExport'));
const POSSystem = lazy(() => import('./pos/POSSystem'));

function P({ children }) {
  return <PortalRoute>{children}</PortalRoute>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Suspense fallback={<Center minH="100vh"><Spinner size="xl" color="#7C9A7E" /></Center>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/portal/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<P><Dashboard /></P>} />
            <Route path="/portal" element={<P><Dashboard /></P>} />
            <Route path="/portal/orders" element={<P><Orders /></P>} />
            <Route path="/portal/custom-orders" element={<P><CustomOrders /></P>} />
            <Route path="/portal/income" element={<P><Income /></P>} />
            <Route path="/portal/expenses" element={<P><Expenses /></P>} />
            <Route path="/portal/recipes" element={<P><Recipes /></P>} />
            <Route path="/portal/inventory" element={<P><Inventory /></P>} />
            <Route path="/portal/events" element={<P><Events /></P>} />
            <Route path="/portal/mileage" element={<P><Mileage /></P>} />
            <Route path="/portal/suppliers" element={<P><Suppliers /></P>} />
            <Route path="/portal/menu" element={<P><MenuManager /></P>} />
            <Route path="/portal/taxes" element={<P><TaxExport /></P>} />
            <Route path="/pos" element={<P><POSSystem /></P>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
