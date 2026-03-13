import React from 'react';
import { Text, HStack, VStack, Badge } from '@chakra-ui/react';
import SimpleList from './SimpleList';

const CATS = ['ingredients','equipment','packaging','marketing','kitchen','mileage','fees','other'];

export default function Expenses() {
  return (
    <SimpleList
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
          <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="#e07b7b" fontWeight="600">-${parseFloat(item.amount).toFixed(2)}</Text>
        </HStack>
      )}
    />
  );
}
