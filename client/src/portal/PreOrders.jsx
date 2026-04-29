import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, VStack, HStack, Badge, Select, Spinner } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const STATUS_COLORS = {
  pending: '#C9A84C',
  confirmed: '#7CB97E',
  ready: '#5b9bd5',
  cancelled: '#555',
};

const STATUSES = ['pending', 'confirmed', 'ready', 'cancelled'];

function PreOrderCard({ preorder, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await portalFetch(`/portal/api/preorders/${preorder.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onStatusChange(updated);
      }
    } catch {}
    setUpdating(false);
  };

  const items = Array.isArray(preorder.items)
    ? preorder.items
    : (() => { try { return JSON.parse(preorder.items); } catch { return []; } })();

  return (
    <Box bg="#1a1a1a" border="1px solid #2a2a2a" borderRadius="4px" p={5} mb={4}>
      <HStack justify="space-between" wrap="wrap" gap={3} mb={3}>
        <VStack align="start" spacing={0}>
          <Text fontFamily="Georgia, serif" fontSize="lg" fontWeight="600" color="white">{preorder.name}</Text>
          <HStack spacing={3} mt={1} wrap="wrap">
            {preorder.email && (
              <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888">{preorder.email}</Text>
            )}
            {preorder.phone && (
              <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888">{preorder.phone}</Text>
            )}
          </HStack>
        </VStack>
        <VStack align="end" spacing={1}>
          <Badge
            bg={STATUS_COLORS[preorder.status] || '#555'}
            color="white"
            borderRadius="2px"
            fontSize="11px"
            px={2} py={1}
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            {preorder.status}
          </Badge>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">
            Market: {preorder.market_date}
          </Text>
        </VStack>
      </HStack>

      {/* Items */}
      {items.length > 0 && (
        <Box mb={3} p={3} bg="#111" borderRadius="2px">
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" textTransform="uppercase" letterSpacing="0.1em" mb={2}>Items</Text>
          {items.map((item, i) => (
            <HStack key={i} justify="space-between" py={1}>
              <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#ccc">{item.name}</Text>
              <Badge bg="#222" color="#888" borderRadius="2px" fontSize="11px">×{item.quantity}</Badge>
            </HStack>
          ))}
        </Box>
      )}

      {/* Notes */}
      {preorder.notes && (
        <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#777" mb={3} fontStyle="italic">
          "{preorder.notes}"
        </Text>
      )}

      {/* Status change */}
      <HStack spacing={2} align="center">
        <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" textTransform="uppercase" letterSpacing="0.08em" whiteSpace="nowrap">
          Update status:
        </Text>
        <Select
          size="sm"
          value={preorder.status}
          onChange={e => handleStatus(e.target.value)}
          disabled={updating}
          bg="#111"
          borderColor="#333"
          color="#ccc"
          borderRadius="2px"
          fontFamily="'Lato', sans-serif"
          fontSize="sm"
          maxW="160px"
          _hover={{ borderColor: '#555' }}
        >
          {STATUSES.map(s => (
            <option key={s} value={s} style={{ background: '#111' }}>{s}</option>
          ))}
        </Select>
        {updating && <Spinner size="xs" color="#7C9A7E" />}
      </HStack>

      <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#444" mt={3}>
        Received: {new Date(preorder.created_at).toLocaleString()}
      </Text>
    </Box>
  );
}

export default function PreOrders() {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await portalFetch('/portal/api/preorders');
      if (res.ok) {
        const data = await res.json();
        setPreorders(data);
      } else {
        setError('Failed to load pre-orders');
      }
    } catch {
      setError('Failed to load pre-orders');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (updated) => {
    setPreorders(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <PortalLayout title="Pre-Orders">
      {loading && (
        <HStack justify="center" py={12}>
          <Spinner color="#7C9A7E" />
          <Text color="#666" fontFamily="'Lato', sans-serif">Loading...</Text>
        </HStack>
      )}
      {error && !loading && (
        <Text color="#e07b7b" fontFamily="'Lato', sans-serif">{error}</Text>
      )}
      {!loading && !error && preorders.length === 0 && (
        <Box py={12} textAlign="center">
          <Text fontFamily="Georgia, serif" fontSize="xl" color="#555">No pre-orders yet</Text>
          <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#444" mt={2}>
            When customers pre-order for market, they'll appear here.
          </Text>
        </Box>
      )}
      {!loading && preorders.map(p => (
        <PreOrderCard key={p.id} preorder={p} onStatusChange={handleStatusChange} />
      ))}
    </PortalLayout>
  );
}
