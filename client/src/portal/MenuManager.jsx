import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, Button, Input, Textarea, Select, Switch, Grid, Spinner, Image } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const inputStyle = { bg: '#111', border: '1px solid', borderColor: '#333', borderRadius: '2px', color: 'white', fontFamily: "'Lato', sans-serif", size: 'sm', _focus: { borderColor: '#C9A84C', boxShadow: 'none' }, _placeholder: { color: '#444' } };
const CATS = ['Breads','Pastries','Cookies','Seasonal Specials','Coffee & Drinks'];

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({});

  const load = () => portalFetch('/portal/api/menu-items').then(r => r.json()).then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const saveEdit = async (id) => {
    await portalFetch(`/portal/api/menu-items/${id}`, { method: 'PATCH', body: JSON.stringify(editing) });
    setEditing(null); load();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await portalFetch('/portal/api/menu-items', { method: 'POST', body: JSON.stringify(form) });
    setForm({}); setShowAdd(false); load();
  };

  const toggleAvailable = async (item) => {
    await portalFetch(`/portal/api/menu-items/${item.id}`, { method: 'PATCH', body: JSON.stringify({ available: item.available ? 0 : 1 }) });
    load();
  };

  if (loading) return <PortalLayout title="Menu Management"><Spinner color="#C9A84C" /></PortalLayout>;

  const grouped = CATS.reduce((acc, cat) => { acc[cat] = items.filter(i => i.category === cat); return acc; }, {});

  return (
    <PortalLayout title="Menu Management">
      <Button mb={6} bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" _hover={{ bg: '#b8943d' }} onClick={() => setShowAdd(s => !s)}>
        {showAdd ? '✕ Cancel' : '+ Add Menu Item'}
      </Button>

      {showAdd && (
        <Box bg="#1a1a1a" border="1px solid" borderColor="#C9A84C" borderRadius="4px" p={5} mb={6}>
          <form onSubmit={handleAdd}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3} mb={4}>
              <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">Name</Text><Input {...inputStyle} value={form.name||''} onChange={e => setForm(p => ({...p,name:e.target.value}))} required /></Box>
              <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">Category</Text><Select {...inputStyle} value={form.category||''} onChange={e => setForm(p => ({...p,category:e.target.value}))} required><option value="">Select...</option>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</Select></Box>
              <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">Price ($)</Text><Input {...inputStyle} type="number" step="0.01" value={form.price||''} onChange={e => setForm(p => ({...p,price:e.target.value}))} required /></Box>
              <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">Image URL</Text><Input {...inputStyle} placeholder="https://..." value={form.image_url||''} onChange={e => setForm(p => ({...p,image_url:e.target.value}))} /></Box>
              <Box gridColumn="1/-1"><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} textTransform="uppercase" letterSpacing="0.1em">Description</Text><Textarea {...inputStyle} rows={2} value={form.description||''} onChange={e => setForm(p => ({...p,description:e.target.value}))} /></Box>
            </Grid>
            <Button type="submit" bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" _hover={{ bg: '#b8943d' }}>Save</Button>
          </form>
        </Box>
      )}

      {CATS.map(cat => grouped[cat]?.length > 0 && (
        <Box key={cat} mb={8}>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" letterSpacing="0.15em" textTransform="uppercase" mb={3} borderBottom="1px solid" borderColor="#222" pb={2}>{cat}</Text>
          <VStack spacing={2} align="stretch">
            {grouped[cat].map(item => (
              <Box key={item.id} bg="#1a1a1a" border="1px solid" borderColor="#222" borderRadius="4px" p={4} opacity={item.available ? 1 : 0.5}>
                {editing?.id === item.id ? (
                  <VStack spacing={3} align="stretch">
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1}>Name</Text><Input {...inputStyle} value={editing.name} onChange={e => setEditing(p => ({...p,name:e.target.value}))} /></Box>
                      <Box><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1}>Price</Text><Input {...inputStyle} type="number" step="0.01" value={editing.price} onChange={e => setEditing(p => ({...p,price:e.target.value}))} /></Box>
                      <Box gridColumn="1/-1"><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1}>Image URL</Text><Input {...inputStyle} value={editing.image_url||''} onChange={e => setEditing(p => ({...p,image_url:e.target.value}))} /></Box>
                      <Box gridColumn="1/-1"><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1}>Description</Text><Textarea {...inputStyle} rows={2} value={editing.description||''} onChange={e => setEditing(p => ({...p,description:e.target.value}))} /></Box>
                    </Grid>
                    <HStack><Button size="sm" bg="#C9A84C" color="#111" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" _hover={{bg:'#b8943d'}} onClick={() => saveEdit(item.id)}>Save</Button><Button size="sm" variant="ghost" color="#666" onClick={() => setEditing(null)}>Cancel</Button></HStack>
                  </VStack>
                ) : (
                  <Flex align="center" gap={4}>
                    <Image src={item.image_url} w="56px" h="56px" objectFit="cover" borderRadius="2px" fallback={<Box w="56px" h="56px" bg="#222" borderRadius="2px" display="flex" alignItems="center" justifyContent="center"><Text fontSize="lg">🥐</Text></Box>} />
                    <Box flex={1}>
                      <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white" fontWeight="600">{item.name}</Text>
                      <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#C9A84C">${parseFloat(item.price).toFixed(2)}</Text>
                    </Box>
                    <HStack spacing={3}>
                      <HStack spacing={2}><Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555">Active</Text><Switch isChecked={!!item.available} onChange={() => toggleAvailable(item)} colorScheme="yellow" size="sm" /></HStack>
                      <Button size="xs" variant="outline" borderColor="#333" color="#888" borderRadius="2px" fontFamily="'Lato', sans-serif" _hover={{ borderColor: '#C9A84C', color: '#C9A84C' }} onClick={() => setEditing({...item})}>Edit</Button>
                    </HStack>
                  </Flex>
                )}
              </Box>
            ))}
          </VStack>
        </Box>
      ))}
    </PortalLayout>
  );
}
