import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, Badge, Select, Spinner } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const STATUS_COLORS = { pending: ['#2a2000','#C9A84C'], ready: ['#002a1a','#7CB97E'], completed: ['#1a1a1a','#555'], cancelled: ['#2a1a1a','#e07b7b'] };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { portalFetch('/portal/api/orders').then(r => r.json()).then(d => { setOrders(d); setLoading(false); }); }, []);

  const updateStatus = async (id, status) => {
    const res = await portalFetch(`/portal/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    const updated = await res.json();
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
  };

  if (loading) return <PortalLayout title="Orders"><Spinner color="#C9A84C" /></PortalLayout>;

  return (
    <PortalLayout title="Pickup Orders">
      {orders.length === 0 ? <Text color="#666" fontFamily="'Lato', sans-serif">No orders yet.</Text> : (
        <VStack spacing={3} align="stretch">
          {orders.map(o => {
            const items = JSON.parse(o.items || '[]');
            const [bg, col] = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
            return (
              <Box key={o.id} bg="#1a1a1a" border="1px solid" borderColor="#222" borderRadius="4px" p={5}>
                <Flex justify="space-between" align="start" wrap="wrap" gap={3}>
                  <VStack align="start" spacing={1}>
                    <Text fontFamily="'Playfair Display', serif" fontWeight="600" color="white" fontSize="lg">{o.customer_name}</Text>
                    <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888">📞 {o.customer_phone}</Text>
                    <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#C9A84C">🕐 {o.pickup_time}</Text>
                    <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555">{new Date(o.created_at).toLocaleString()}</Text>
                  </VStack>
                  <VStack align="end" spacing={2}>
                    <Text fontFamily="'Playfair Display', serif" fontSize="xl" color="#C9A84C">${parseFloat(o.total).toFixed(2)}</Text>
                    <Select size="sm" value={o.status} onChange={e => updateStatus(o.id, e.target.value)} bg={bg} color={col} border="none" borderRadius="2px" fontFamily="'Lato', sans-serif" fontSize="xs" fontWeight="700" w="130px" textTransform="uppercase" letterSpacing="0.08em">
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </VStack>
                </Flex>
                <Box mt={3} pt={3} borderTop="1px solid" borderColor="#222">
                  {items.map((item, i) => (
                    <Flex key={i} justify="space-between">
                      <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#ccc">{item.name} × {item.quantity}</Text>
                      <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888">${(item.price * item.quantity).toFixed(2)}</Text>
                    </Flex>
                  ))}
                  {o.notes && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" mt={2} fontStyle="italic">Notes: {o.notes}</Text>}
                </Box>
              </Box>
            );
          })}
        </VStack>
      )}
    </PortalLayout>
  );
}
