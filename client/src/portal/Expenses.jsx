import React, { useRef, useState } from 'react';
import { Text, HStack, VStack, Badge, Box, Spinner, Tooltip } from '@chakra-ui/react';
import SimpleList from './SimpleList';
import { portalFetch } from './auth';

const CATS = ['ingredients','labor','electricity','payment_processing','equipment','packaging','marketing','kitchen','mileage','fees','other'];

function ReceiptButton({ item, onRefresh }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [hasReceipt, setHasReceipt] = useState(!!item.has_receipt);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // strip "data:mime/type;base64," prefix
          const result = reader.result;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await portalFetch(`/portal/api/expenses/${item.id}/receipt`, {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, mime_type: file.type, data }),
      });
      setHasReceipt(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Receipt upload failed', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleView = async () => {
    try {
      const res = await portalFetch(`/portal/api/expenses/${item.id}/receipt`);
      if (!res.ok) { alert('Receipt not found'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to view receipt', err);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (!confirm('Remove this receipt?')) return;
    await portalFetch(`/portal/api/expenses/${item.id}/receipt`, { method: 'DELETE' });
    setHasReceipt(false);
    if (onRefresh) onRefresh();
  };

  if (uploading) return <Spinner size="xs" color="#C9A84C" />;

  return (
    <HStack spacing={1}>
      {hasReceipt ? (
        <>
          <Tooltip label="View receipt" placement="top">
            <Box
              as="button"
              onClick={handleView}
              fontSize="14px"
              title="View receipt"
              cursor="pointer"
              color="#C9A84C"
              _hover={{ color: '#e8c26c' }}
            >
              🧾
            </Box>
          </Tooltip>
          <Tooltip label="Remove receipt" placement="top">
            <Box
              as="button"
              onClick={handleRemove}
              fontSize="10px"
              color="#555"
              cursor="pointer"
              _hover={{ color: '#e07b7b' }}
              title="Remove receipt"
            >
              ✕
            </Box>
          </Tooltip>
        </>
      ) : (
        <Tooltip label="Upload receipt" placement="top">
          <Box
            as="button"
            onClick={() => inputRef.current?.click()}
            fontSize="13px"
            color="#444"
            cursor="pointer"
            _hover={{ color: '#888' }}
            title="Upload receipt"
          >
            📎
          </Box>
        </Tooltip>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </HStack>
  );
}

export default function Expenses() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <SimpleList
      key={refreshKey}
      title="Expenses"
      endpoint="/portal/api/expenses"
      fields={[
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'description', label: 'Description', placeholder: 'What was purchased', required: true },
        { key: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0.00', required: true },
        { key: 'category', label: 'Category', type: 'select', options: CATS },
        { key: 'receipt_ref', label: 'Receipt #', placeholder: 'Optional' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional' },
      ]}
      formatRow={item => (
        <HStack justify="space-between" wrap="wrap" gap={2}>
          <VStack align="start" spacing={0}>
            <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white">{item.description}</Text>
            <HStack spacing={2} mt={0.5}>
              <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">{item.date}</Text>
              <Badge bg="#1e1e1e" color="#888" borderRadius="2px" fontSize="10px" textTransform="uppercase">{item.category}</Badge>
              {item.deductible ? <Badge bg="#002a0a" color="#7CB97E" borderRadius="2px" fontSize="10px">deductible</Badge> : null}
            </HStack>
          </VStack>
          <HStack spacing={3} align="center">
            <ReceiptButton item={item} onRefresh={handleRefresh} />
            <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="#e07b7b" fontWeight="600">-${parseFloat(item.amount).toFixed(2)}</Text>
          </HStack>
        </HStack>
      )}
    />
  );
}
