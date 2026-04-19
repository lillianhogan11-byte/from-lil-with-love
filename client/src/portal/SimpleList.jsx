// Reusable component for income, expenses, events, mileage, suppliers, recipes
import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Flex, Button, Input, Select, HStack, Grid, Spinner, Textarea } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch } from './auth';

const inputStyle = { bg: '#111', border: '1px solid', borderColor: '#333', borderRadius: '2px', color: 'white', fontFamily: "'Lato', sans-serif", size: 'sm', _focus: { borderColor: '#C9A84C', boxShadow: 'none' }, _placeholder: { color: '#444' } };

export default function SimpleList({ title, endpoint, fields, formatRow }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => portalFetch(endpoint).then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleEdit = (item) => {
    setForm({ ...item });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await portalFetch(`${endpoint}/${editingId}`, { method: 'PUT', body: JSON.stringify(form) });
      setEditingId(null);
    } else {
      await portalFetch(endpoint, { method: 'POST', body: JSON.stringify(form) });
    }
    setForm({});
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await portalFetch(`${endpoint}/${id}`, { method: 'DELETE' });
    load();
  };

  if (loading) return <PortalLayout title={title}><Spinner color="#C9A84C" /></PortalLayout>;

  return (
    <PortalLayout title={title}>
      <Button
        mb={4}
        bg={showForm && !editingId ? '#333' : '#C9A84C'}
        color={showForm && !editingId ? 'white' : '#111'}
        size="sm"
        borderRadius="2px"
        fontFamily="'Lato', sans-serif"
        fontWeight="700"
        letterSpacing="0.08em"
        textTransform="uppercase"
        _hover={{ bg: showForm && !editingId ? '#444' : '#b8943d' }}
        onClick={() => { if (showForm) { handleCancel(); } else { setShowForm(true); } }}
      >
        {showForm ? '✕ Cancel' : '+ Add New'}
      </Button>

      {showForm && (
        <Box bg="#1a1a1a" border="1px solid" borderColor={editingId ? '#7CB97E' : '#C9A84C'} borderRadius="4px" p={5} mb={6}>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color={editingId ? '#7CB97E' : '#C9A84C'} mb={3} letterSpacing="0.12em" textTransform="uppercase" fontWeight="700">
            {editingId ? '✎ Editing Entry' : '+ New Entry'}
          </Text>
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
            <HStack spacing={3}>
              <Button type="submit" isLoading={saving} bg={editingId ? '#7CB97E' : '#C9A84C'} color="#111" size="sm" borderRadius="2px" fontFamily="'Lato', sans-serif" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" _hover={{ bg: editingId ? '#6aa86c' : '#b8943d' }}>
                {editingId ? 'Save Changes' : 'Save'}
              </Button>
              {editingId && (
                <Button type="button" onClick={handleCancel} size="sm" variant="ghost" color="#888" fontFamily="'Lato', sans-serif" fontSize="xs" _hover={{ color: 'white' }}>
                  Cancel
                </Button>
              )}
            </HStack>
          </form>
        </Box>
      )}

      {items.length === 0 ? <Text color="#666" fontFamily="'Lato', sans-serif" fontSize="sm">Nothing here yet.</Text> : (
        <VStack spacing={2} align="stretch">
          {items.map(item => (
            <Box
              key={item.id}
              bg={editingId === item.id ? '#1a2a1a' : '#1a1a1a'}
              border="1px solid"
              borderColor={editingId === item.id ? '#7CB97E' : '#222'}
              borderRadius="4px"
              p={4}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="start" wrap="wrap" gap={2}>
                <Box flex={1}>{formatRow(item)}</Box>
                <HStack spacing={1}>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#C9A84C"
                    onClick={() => handleEdit(item)}
                    _hover={{ color: '#e8c26c', bg: 'transparent' }}
                    title="Edit"
                  >
                    ✎
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="#555"
                    onClick={() => handleDelete(item.id)}
                    _hover={{ color: '#e07b7b', bg: 'transparent' }}
                    title="Delete"
                  >
                    ✕
                  </Button>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </PortalLayout>
  );
}
