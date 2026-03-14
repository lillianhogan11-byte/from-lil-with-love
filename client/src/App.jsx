import React from 'react';
import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import About from './components/About';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';

// POS
import POSSystem from './pos/POSSystem';

// Portal
import PortalRoute from './portal/PortalRoute';
import Login from './portal/Login';
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

function HomePage() {
  return (
    <Box>
      <Navbar />
      <Box as="main">
        <Hero />
        <MenuSection />
        <About />
      </Box>
      <Footer />
    </Box>
  );
}

function P({ children }) {
  return <PortalRoute>{children}</PortalRoute>;
}

function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<><Navbar /><Cart /></>} />
      <Route path="/checkout" element={<><Navbar /><Checkout /></>} />
      <Route path="/confirmation" element={<><Navbar /><Confirmation /></>} />

      {/* Portal auth */}
      <Route path="/portal/login" element={<Login />} />

      {/* Portal protected */}
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

      {/* POS */}
      <Route path="/pos" element={<P><POSSystem /></P>} />
    </Routes>
  );
}

export default App;
