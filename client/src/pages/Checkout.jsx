import React, { useState } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, FormControl,
  FormLabel, Input, Select, Textarea, Divider, Flex, HStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api';

function generateTimeSlots() {
  const slots = [];
  const now = new Date();
  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    const label = dayOffset === 0 ? 'Today' : 'Tomorrow';
    const dateStr = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    for (let hour = 8; hour < 18; hour++) {
      for (const min of [0, 30]) {
        const slot = new Date(day);
        slot.setHours(hour, min, 0, 0);
        if (dayOffset === 0 && slot <= new Date(now.getTime() + 30 * 60000)) continue;
        const time = slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        slots.push({ value: `${label}, ${dateStr} at ${time}`, label: `${label} ${dateStr} — ${time}` });
      }
    }
  }
  return slots;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', pickupTime: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slots = generateTimeSlots();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.pickupTime) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          pickup_time: form.pickupTime,
          notes: form.notes,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total,
        }),
      });
      if (!res.ok) throw new Error('Order failed');
      const order = await res.json();
      clearCart();
      navigate('/confirmation', { state: { order, name: form.name, pickupTime: form.pickupTime } });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    bg: 'white', border: '1px solid', borderColor: '#E0E0E0',
    borderRadius: '2px', fontFamily: "'Lato', sans-serif",
    _focus: { borderColor: '#C9A84C', boxShadow: '0 0 0 1px #C9A84C' },
  };

  return (
    <Box minH="80vh" bg="#FAF7F2" pt={{ base: 24, md: 32 }} pb={16}>
      <Container maxW="lg">
        <Heading fontFamily="'Playfair Display', serif" fontSize={{ base: '2xl', md: '3xl' }} mb={2} color="#1A1A1A">
          Checkout
        </Heading>
        <Text fontFamily="'Lato', sans-serif" color="#888" mb={8} fontSize="sm">
          Pay when you arrive — no payment needed now.
        </Text>

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel fontFamily="'Lato', sans-serif" fontSize="sm" fontWeight="600" color="#1A1A1A">Name</FormLabel>
              <Input {...inputStyle} placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily="'Lato', sans-serif" fontSize="sm" fontWeight="600" color="#1A1A1A">Phone</FormLabel>
              <Input {...inputStyle} placeholder="(555) 555-5555" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontFamily="'Lato', sans-serif" fontSize="sm" fontWeight="600" color="#1A1A1A">Pickup Time</FormLabel>
              <Select {...inputStyle} placeholder="Choose a time" value={form.pickupTime} onChange={e => setForm(f => ({ ...f, pickupTime: e.target.value }))}>
                {slots.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontFamily="'Lato', sans-serif" fontSize="sm" fontWeight="600" color="#1A1A1A">Notes <Text as="span" fontWeight="400" color="#999">(optional)</Text></FormLabel>
              <Textarea {...inputStyle} placeholder="Allergies, special requests..." rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </FormControl>

            <Divider borderColor="#E8E4DE" />

            <Box>
              <Text fontFamily="'Playfair Display', serif" fontWeight="600" mb={3} color="#1A1A1A">Order Summary</Text>
              <VStack spacing={2} align="stretch">
                {items.map(i => (
                  <Flex key={i.id} justify="space-between" fontFamily="'Lato', sans-serif" fontSize="sm">
                    <Text color="#444">{i.name} × {i.quantity}</Text>
                    <Text color="#1A1A1A" fontWeight="600">${(i.price * i.quantity).toFixed(2)}</Text>
                  </Flex>
                ))}
              </VStack>
              <Divider borderColor="#E8E4DE" my={3} />
              <Flex justify="space-between" fontFamily="'Playfair Display', serif">
                <Text fontWeight="600">Total</Text>
                <Text fontWeight="600" color="#C9A84C">${total.toFixed(2)}</Text>
              </Flex>
            </Box>

            {error && <Text color="red.500" fontFamily="'Lato', sans-serif" fontSize="sm">{error}</Text>}

            <Button
              type="submit" isLoading={loading} loadingText="Placing order..."
              w="full" size="lg"
              bg="#C9A84C" color="#1A1A1A"
              fontFamily="'Lato', sans-serif" fontWeight="700"
              letterSpacing="0.08em" textTransform="uppercase" fontSize="sm"
              py={7} borderRadius="2px"
              _hover={{ bg: '#b8943d' }}
            >
              Place Order
            </Button>
          </VStack>
        </form>
      </Container>
    </Box>
  );
}
