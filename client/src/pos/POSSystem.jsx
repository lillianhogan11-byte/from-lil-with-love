import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Text, Heading, Button, Grid, useToast } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { portalFetch } from '../portal/auth';
import POSItem from './POSItem';
import POSCart from './POSCart';

const CREAM = '#FAF7F2';
const GREEN = '#7C9A7E';
const GOLD = '#C9A84C';
const DARK = '#1A1A1A';
const TAX_RATE = 0.07;

export default function POSSystem() {
  const [menuData, setMenuData] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState('Cash');
  const [confirmation, setConfirmation] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch menu
  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => {
        setMenuData(data);
        setCategories(Object.keys(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPaymentType('Cash');
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity }));
    try {
      const res = await portalFetch('/api/pos/orders', {
        method: 'POST',
        body: JSON.stringify({ items, total, payment_type: paymentType, customer_name: 'Walk-in' }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      const order = await res.json();
      setConfirmation({ id: order.id, total });
      setCart([]);
      setPaymentType('Cash');
      setTimeout(() => setConfirmation(null), 5000);
    } catch {
      toast({
        title: 'Failed to place order',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <Flex
      direction="column"
      h="100vh"
      bg={CREAM}
      overflow="hidden"
      fontFamily="'Lato', sans-serif"
    >
      {/* ── Header ── */}
      <Flex
        bg={DARK}
        color="white"
        px={6}
        py={3}
        align="center"
        justify="space-between"
        flexShrink={0}
        minH="56px"
      >
        <Heading
          size="md"
          fontFamily="'Playfair Display', serif"
          color={GOLD}
          letterSpacing="wide"
        >
          The Biscuit Bar — POS
        </Heading>

        <Text fontSize="xl" fontWeight="700" color="gray.300" letterSpacing="widest">
          {timeStr}
        </Text>

        <Link to="/portal" style={{ textDecoration: 'none' }}>
          <Text
            fontSize="sm"
            color={GOLD}
            fontWeight="500"
            _hover={{ textDecoration: 'underline' }}
            cursor="pointer"
          >
            ← Back to Portal
          </Text>
        </Link>
      </Flex>

      {/* ── Main ── */}
      <Flex flex={1} overflow="hidden">

        {/* Left 60%: Menu browser */}
        <Flex
          flex="0 0 60%"
          direction="column"
          overflow="hidden"
          borderRight="2px solid"
          borderColor="gray.200"
        >
          {/* Category tabs */}
          <Box bg={GREEN} px={4} pt={3} pb={0} flexShrink={0}>
            <Flex gap={2} flexWrap="wrap" pb={3}>
              {categories.map((cat, i) => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCatIdx(i)}
                  size="sm"
                  bg={selectedCatIdx === i ? GOLD : 'rgba(255,255,255,0.18)'}
                  color={selectedCatIdx === i ? DARK : 'white'}
                  fontWeight={selectedCatIdx === i ? '700' : '500'}
                  borderRadius="full"
                  px={5}
                  py={5}
                  fontSize="sm"
                  _hover={{
                    bg: selectedCatIdx === i ? GOLD : 'rgba(255,255,255,0.30)',
                  }}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="all 0.15s"
                >
                  {cat}
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Item grid */}
          <Box flex={1} overflowY="auto" p={5} bg={CREAM}>
            {loading ? (
              <Text color="gray.400" textAlign="center" mt={10}>
                Loading menu…
              </Text>
            ) : (
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {(menuData[categories[selectedCatIdx]] || []).map((item) => (
                  <POSItem key={item.id} item={item} onAdd={addToCart} />
                ))}
              </Grid>
            )}
          </Box>
        </Flex>

        {/* Right 40%: Cart */}
        <Box flex="0 0 40%" overflow="hidden" display="flex" flexDirection="column" bg="white">
          <POSCart
            items={cart}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onClear={clearCart}
            onPlaceOrder={placeOrder}
            paymentType={paymentType}
            onPaymentType={setPaymentType}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </Box>
      </Flex>

      {/* ── Full-screen confirmation overlay ── */}
      {confirmation && (
        <Flex
          position="fixed"
          inset={0}
          bg="rgba(124, 154, 126, 0.97)"
          direction="column"
          align="center"
          justify="center"
          zIndex={9999}
          fontFamily="'Lato', sans-serif"
        >
          <Text fontSize="80px" lineHeight={1} mb={4}>
            ✓
          </Text>
          <Heading
            fontFamily="'Playfair Display', serif"
            color="white"
            fontSize="4xl"
            mb={3}
          >
            Order Placed!
          </Heading>
          <Heading
            fontFamily="'Playfair Display', serif"
            color={GOLD}
            fontSize="2xl"
            mb={2}
          >
            Order #{confirmation.id}
          </Heading>
          <Text fontSize="2xl" color="white" fontWeight="700">
            ${confirmation.total.toFixed(2)} — {confirmation.paymentType || 'Paid'}
          </Text>
          <Text color="rgba(255,255,255,0.75)" mt={8} fontSize="md">
            Resetting in 5 seconds…
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
