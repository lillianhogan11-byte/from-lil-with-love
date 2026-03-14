import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PortalRoute from './portal/PortalRoute';
import Login from './portal/Login';
import AuthCallback from './portal/AuthCallback';
import Dashboard from './portal/Dashboard';
import Orders from './portal/Orders';
import CustomOrders from './portal/CustomOrders';
import Income from './portal/Income';
import Expenses from './portal/Expenses';
import Recipes from './portal/Recipes';
import Inventory from './portal/Inventory';
import Events from './portal/Events';
import Mileage from './portal/Mileage';
import Suppliers from './portal/Suppliers';
import MenuManager from './portal/MenuManager';
import TaxExport from './portal/TaxExport';
import POSSystem from './pos/POSSystem';

function P({ children }) {
  return <PortalRoute>{children}</PortalRoute>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
