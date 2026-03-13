// Reusable component for income, expenses, events, mileage, suppliers
import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Flex, Button, Input, Select, HStack, Grid, Spinner, Textarea } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const inputStyle = { bg: '#111', border: '1px solid', borderColor: '#333', borderRadius: '2px', color: 'white', fontFamily: "'Lato', sans-serif", size: 'sm', _focus: { borderColor: '#C9A84C', boxShadow: 'none' }, _placeholder: { color: '#444' } };

export default function SimpleList({ title, endpoint, fields, columns, formatRow }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => portalFetch(endpoint).then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    await portalFetch(endpoint, { method: 'POST', body: JSON.stringify(form) });
    setForm({}); setShowForm(false); setSaving(false); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await portalFetch(`${endpoint}/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <PortalLayout title={title}><Spinner color="#C9A84C" /></PortalLayout>;

  return (
    <PortalLayout title={title}>
      <Button mb={4} bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase" _hover={{ bg: '#b8943d' }} onClick={() => setShowForm(s => !s)}>
        {showForm ? '✕ Cancel' : '+ Add New'}
      </Button>

      {showForm && (
        <Box bg="#1a1a1a" border="1px solid" borderColor="#C9A84C" borderRadius="4px" p={5} mb={6}>
          <form onSubmit={handleSubmit}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3} mb={4}>
              {fields.map(f => (
                <Box key={f.key}>
                  <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={1} letterSpacing="0.1em" textTransform="uppercase">{f.label}</Text>
                  {f.type === 'select' ? (
                    <Select {...inputStyle} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  ) : f.type === 'textarea' ? (
                    <Textarea {...inputStyle} placeholder={f.placeholder || ''} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={2} />
                  ) : (
                    <Input {...inputStyle} type={f.type || 'text'} placeholder={f.placeholder || ''} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.required} />
                  )}
                </Box>
              ))}
            </Grid>
            <Button type="submit" isLoading={saving} bg="#C9A84C" color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" _hover={{ bg: '#b8943d' }}>Save</Button>
          </form>
        </Box>
      )}

      {items.length === 0 ? <Text color="#666" fontFamily="'Lato', sans-serif" fontSize="sm">Nothing here yet.</Text> : (
        <VStack spacing={2} align="stretch">
          {items.map(item => (
            <Box key={item.id} bg="#1a1a1a" border="1px solid" borderColor="#222" borderRadius="4px" p={4}>
              <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
                <Box flex={1}>{formatRow(item)}</Box>
                <Button size="xs" variant="ghost" color="#555" onClick={() => handleDelete(item.id)} _hover={{ color: '#e07b7b' }}>✕</Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </PortalLayout>
  );
}
