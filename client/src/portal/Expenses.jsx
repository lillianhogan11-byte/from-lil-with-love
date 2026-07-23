import React, { useRef, useState, useEffect } from 'react';
import { Text, HStack, VStack, Badge, Box, Spinner, Tooltip } from '@chakra-ui/react';
import SimpleList from './SimpleList';
import { portalFetch } from './auth';

const CATS = ['ingredients','labor','electricity','payment_processing','equipment','packaging','marketing','kitchen','mileage','fees','other'];

function ReceiptButton({ item, onRefresh }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [receiptCount, setReceiptCount] = useState(item.receipt_count || 0);
  const [receipts, setReceipts] = useState(null); // null = not loaded, [] = loaded empty
  const [showList, setShowList] = useState(false);

  // Keep in sync if parent refreshes
  useEffect(() => {
    setReceiptCount(item.receipt_count || 0);
  }, [item.receipt_count]);

  const loadReceipts = async () => {
    try {
      const res = await portalFetch(`/portal/api/expenses/${item.id}/receipts`);
      if (res.ok) {
        const data = await res.json();
        setReceipts(data);
        setReceiptCount(data.length);
      }
    } catch (err) {
      console.error('Failed to load receipts', err);
    }
  };

  const handleToggleList = async () => {
    if (!showList) {
      await loadReceipts();
      setShowList(true);
    } else {
      setShowList(false);
    }
  };

  const handleView = async (rid) => {
    try {
      const res = await portalFetch(`/portal/api/expenses/${item.id}/receipts/${rid}`);
      if (!res.ok) { alert('Receipt not found'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Failed to view receipt', err);
    }
  };

  const handleRemove = async (e, rid) => {
    e.stopPropagation();
    if (!confirm('Remove this receipt?')) return;
    await portalFetch(`/portal/api/expenses/${item.id}/receipts/${rid}`, { method: 'DELETE' });
    const updated = (receipts || []).filter(r => r.id !== rid);
    setReceipts(updated);
    setReceiptCount(updated.length);
    if (updated.length === 0) setShowList(false);
    if (onRefresh) onRefresh();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await portalFetch(`/portal/api/expenses/${item.id}/receipt`, {
          method: 'POST',
          body: JSON.stringify({ filename: file.name, mime_type: file.type, data }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          alert(`Upload failed for ${file.name} (${res.status}): ${body.error || 'Unknown error'}`);
        }
      }
      await loadReceipts();
      setShowList(true);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Receipt upload failed', err);
      alert('Upload failed — check your connection and try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (uploading) return <Spinner size="xs" color="#C9A84C" />;

  return (
    <VStack spacing={1} align="end">
      <HStack spacing={1}>
        {receiptCount > 0 && (
          <Tooltip label={showList ? 'Hide receipts' : `View ${receiptCount} receipt${receiptCount > 1 ? 's' : ''}`} placement="top">
            <HStack
              as="button"
              spacing={0.5}
              onClick={handleToggleList}
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
            >
              <Box fontSize="14px" color="#C9A84C">🧾</Box>
              {receiptCount > 1 && (
                <Box fontSize="10px" color="#C9A84C" fontWeight="bold" lineHeight={1}>{receiptCount}</Box>
              )}
            </HStack>
          </Tooltip>
        )}
        <Tooltip label="Attach receipt(s)" placement="top">
          <Box
            as="button"
            onClick={() => inputRef.current?.click()}
            fontSize="13px"
            color="#444"
            cursor="pointer"
            _hover={{ color: '#888' }}
            title="Attach receipt(s)"
          >
            📎
          </Box>
        </Tooltip>
      </HStack>

      {showList && receipts && receipts.length > 0 && (
        <VStack
          align="start"
          spacing={0.5}
          bg="#1a1a1a"
          border="1px solid #333"
          borderRadius="4px"
          p={1.5}
          minW="160px"
        >
          {receipts.map((r) => (
            <HStack key={r.id} spacing={1} width="100%" justify="space-between">
              <Box
                as="button"
                onClick={() => handleView(r.id)}
                fontSize="11px"
                color="#aaa"
                cursor="pointer"
                _hover={{ color: '#C9A84C' }}
                textAlign="left"
                maxW="130px"
                isTruncated
                title={r.filename}
              >
                {r.filename.length > 18 ? r.filename.slice(0, 16) + '…' : r.filename}
              </Box>
              <Box
                as="button"
                onClick={(e) => handleRemove(e, r.id)}
                fontSize="9px"
                color="#555"
                cursor="pointer"
                _hover={{ color: '#e07b7b' }}
                flexShrink={0}
              >
                ✕
              </Box>
            </HStack>
          ))}
        </VStack>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </VStack>
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
