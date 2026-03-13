import React from 'react';
import { Text, HStack, VStack } from '@chakra-ui/react';
import SimpleList from './SimpleList';

const SOURCES = ['online_order','farmers_market','custom_order','other'];

export default function Income() {
  return (
    <SimpleList
      title="Income"
      endpoint="/portal/api/income"
      fields={[
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'amount', label: 'Amount ($)', type: 'number', placeholder: '0.00', required: true },
        { key: 'source', label: 'Source', type: 'select', options: SOURCES },
        { key: 'description', label: 'Description', placeholder: 'What was sold' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional' },
      ]}
      formatRow={item => (
        <HStack justify="space-between" wrap="wrap" gap={2}>
          <VStack align="start" spacing={0}>
            <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white">{item.description || item.source}</Text>
            <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">{item.date} · {item.source}</Text>
          </VStack>
          <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="#7CB97E" fontWeight="600">+${parseFloat(item.amount).toFixed(2)}</Text>
        </HStack>
      )}
    />
  );
}
