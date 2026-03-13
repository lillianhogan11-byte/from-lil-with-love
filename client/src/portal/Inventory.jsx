import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, Button, Input, Select, Grid, Spinner, Badge } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const inputStyle = { bg: '#111', border: '1px solid', borderColor: '#333', borderRadius: '2px', color: 'white', fontFamily: "'Lato', sans-serif", size: 'sm', _focus: { borderColor: '#C9A84C', boxShadow: 'none' }, _placeholder: { color: '#444' } };
const CATS = ['flour','sugar','dairy','eggs','fats','flavoring','fruit','nuts','packaging','other'];
const UNITS = ['lbs','oz','cups','tbsp','units','bags','boxes','gallons','liters'];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = () => portalFetch('/portal/api/inventory').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await portalFetch('/portal/api/inventory', { method: 'POST', body: JSON.stringify(form) });
    setForm({}); setShowForm(false); load();
  };

  const updateQty = async (id, delta, current) => {
    const qty = Math.max(0, parseFloat(current) + delta);
    await portalFetch(`/portal/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity: qty }) });
    load();
  };

  const del = async (id) => { if (!confirm('Delete?')) return; await portalFetch(`/portal/api/inventory/${id}`, { method: 'DELETE' }); load(); };

  if (loading) return <PortalLayout title="Inventory"><Spinner color="#C9A84C" /></PortalLayout>;

  const low = items.filter(i => i.reorder_level > 0 && i.quantity <= i.reorder_level);

  return (
    <PortalLayout title="Inventory">
      {low.length > 0 && (
        <Box bg="#2a1a1a" border="1px solid" borderColor="#5a2a2a" borderRadius="4px" p={4} mb={5}>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#e07b7b" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" mb={2}>⚠ Low Stock</Text>
          {low.map(i => <Text key={i.id} fontFamily="'Lato', sans-serif" fontSize="sm" color="#e07b7b">{i.name} — {i.quantity} {i.unit} remaining</Text>)}
        </Box>
      )}

      <Button mb={4} bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" _hover={{ bg: '#b8943d' }} onClick={() => setShowForm(s => !s)}>
        {showForm ? '✕ Cancel' : '+ Add Item'}
      </Button>

      {showForm && (
        <Box bg="#1a1a1a" border="1px solid" borderColor="#C9A84C" borderRadius="4px" p={5} mb={5}>
          <form onSubmit={handleAdd}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3} mb={4}>
              {[
                { key: 'name', label: 'Name', required: true },
                { key: 'category', label: 'Category', type: 'select', options: CATS },
                { key: 'unit', label: 'Unit', type: 'select', options: UNITS },
                { key: 'quantity', label: 'Current Qty', type: 'number' },
                { key: 'reorder_level', label: 'Reorder At', type: 'number' },
                { key: 'cost_per_unit', label: 'Cost per Unit ($)', type: 'number' },
              ].map(f => (
                <Box key={f.key}>
                  <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">{f.label}</Text>
                  {f.type === 'select' ? (
                    <Select {...inputStyle} value={form[f.key]||''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  ) : (
                    <Input {...inputStyle} type={f.type||'text'} value={form[f.key]||''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required} />
                  )}
                </Box>
              ))}
            </Grid>
            <Button type="submit" bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" _hover={{ bg: '#b8943d' }}>Save</Button>
          </form>
        </Box>
      )}

      <VStack spacing={2} align="stretch">
        {items.map(item => {
          const isLow = item.reorder_level > 0 && item.quantity <= item.reorder_level;
          return (
            <Box key={item.id} bg="#1a1a1a" border="1px solid" borderColor={isLow ? '#5a2a2a' : '#222'} borderRadius="4px" p={4}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <VStack align="start" spacing={0}>
                  <HStack>
                    <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white" fontWeight="600">{item.name}</Text>
                    {item.category && <Badge bg="#1e1e1e" color="#666" borderRadius="2px" fontSize="10px" textTransform="uppercase">{item.category}</Badge>}
                    {isLow && <Badge bg="#2a1a1a" color="#e07b7b" borderRadius="2px" fontSize="10px">LOW</Badge>}
                  </HStack>
                  {item.cost_per_unit ? <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555">${parseFloat(item.cost_per_unit).toFixed(2)} per {item.unit} · reorder at {item.reorder_level} {item.unit}</Text> : null}
                </VStack>
                <HStack spacing={2}>
                  <Button size="xs" variant="outline" borderColor="#333" color="#ccc" onClick={() => updateQty(item.id, -1, item.quantity)} _hover={{ borderColor: '#C9A84C' }}>−</Button>
                  <Text fontFamily="'Playfair Display', serif" fontSize="lg" color={isLow ? '#e07b7b' : '#C9A84C'} minW="50px" textAlign="center">{item.quantity} {item.unit}</Text>
                  <Button size="xs" variant="outline" borderColor="#333" color="#ccc" onClick={() => updateQty(item.id, 1, item.quantity)} _hover={{ borderColor: '#C9A84C' }}>+</Button>
                  <Button size="xs" variant="ghost" color="#555" onClick={() => del(item.id)} _hover={{ color: '#e07b7b' }}>✕</Button>
                </HStack>
              </Flex>
            </Box>
          );
        })}
      </VStack>
    </PortalLayout>
  );
}
