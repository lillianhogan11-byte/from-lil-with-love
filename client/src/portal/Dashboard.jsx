import React, { useEffect, useState } from 'react';
import { Box, Grid, Text, VStack, HStack, Flex, Spinner, Badge } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

function StatCard({ label, value, sub, color = '#C9A84C' }) {
  return (
    <Box bg="#1a1a1a" borderRadius="4px" border="1px solid" borderColor="#222" p={5}>
      <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" letterSpacing="0.12em" textTransform="uppercase" mb={2}>{label}</Text>
      <Text fontFamily="'Playfair Display', serif" fontSize="2xl" fontWeight="600" color={color}>{value}</Text>
      {sub && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555" mt={1}>{sub}</Text>}
    </Box>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { portalFetch('/portal/api/dashboard').then(r => r.json()).then(setData); }, []);

  if (!data) return <PortalLayout title="Dashboard"><Spinner color="#C9A84C" /></PortalLayout>;

  const fmt = n => `$${parseFloat(n || 0).toFixed(2)}`;

  return (
    <PortalLayout title="Dashboard">
      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={8}>
        <StatCard label="This Month — Revenue" value={fmt(data.month.income)} />
        <StatCard label="This Month — Expenses" value={fmt(data.month.expenses)} color="#e07b7b" />
        <StatCard label="This Month — Profit" value={fmt(data.month.profit)} color={data.month.profit >= 0 ? '#7CB97E' : '#e07b7b'} />
        <StatCard label="YTD Profit" value={fmt(data.year.profit)} sub={`${fmt(data.year.income)} in / ${fmt(data.year.expenses)} out`} color={data.year.profit >= 0 ? '#7CB97E' : '#e07b7b'} />
      </Grid>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={8}>
        <StatCard label="Pending Pickup Orders" value={data.pendingOrders} color="white" />
        <StatCard label="Pending Custom Orders" value={data.pendingCustomOrders} color="white" />
        <StatCard label="Miles Driven (YTD)" value={`${parseFloat(data.totalMilesYTD || 0).toFixed(1)} mi`} sub={`≈ $${(data.totalMilesYTD * 0.67).toFixed(2)} deductible`} color="#7C9A7E" />
        <StatCard label="Low Stock Items" value={data.lowInventory?.length || 0} color={data.lowInventory?.length > 0 ? '#e07b7b' : 'white'} />
      </Grid>

      {data.recentOrders?.length > 0 && (
        <Box bg="#1a1a1a" borderRadius="4px" border="1px solid" borderColor="#222" p={5}>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" letterSpacing="0.12em" textTransform="uppercase" mb={4}>Recent Orders</Text>
          <VStack spacing={2} align="stretch">
            {data.recentOrders.map(o => (
              <Flex key={o.id} justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="#222">
                <VStack align="start" spacing={0}>
                  <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white" fontWeight="600">{o.customer_name}</Text>
                  <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">{o.pickup_time}</Text>
                </VStack>
                <HStack>
                  <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#C9A84C" fontWeight="600">${parseFloat(o.total).toFixed(2)}</Text>
                  <Badge bg={o.status === 'pending' ? '#2a2000' : o.status === 'ready' ? '#002a1a' : '#1a1a1a'} color={o.status === 'pending' ? '#C9A84C' : o.status === 'ready' ? '#7CB97E' : '#666'} borderRadius="2px" fontSize="10px" textTransform="uppercase" letterSpacing="0.1em">{o.status}</Badge>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      {data.lowInventory?.length > 0 && (
        <Box bg="#1a1a1a" borderRadius="4px" border="1px solid" borderColor="#3a1a1a" p={5} mt={4}>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#e07b7b" letterSpacing="0.12em" textTransform="uppercase" mb={3}>⚠ Low Stock</Text>
          {data.lowInventory.map(i => (
            <Flex key={i.id} justify="space-between" py={1}>
              <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#ccc">{i.name}</Text>
              <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#e07b7b">{i.quantity} {i.unit} left</Text>
            </Flex>
          ))}
        </Box>
      )}
    </PortalLayout>
  );
}
