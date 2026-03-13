import React from 'react';
import { Text, HStack, VStack } from '@chakra-ui/react';
import SimpleList from './SimpleList';

export default function Events() {
  return (
    <SimpleList
      title="Events & Markets"
      endpoint="/portal/api/events"
      fields={[
        { key: 'name', label: 'Event Name', required: true, placeholder: "Franklin Farmers Market" },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'location', label: 'Location', placeholder: 'Address or venue' },
        { key: 'revenue', label: 'Revenue ($)', type: 'number', placeholder: '0.00' },
        { key: 'expenses', label: 'Expenses ($)', type: 'number', placeholder: '0.00' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'What sold well, booth notes...' },
      ]}
      formatRow={item => {
        const profit = (item.revenue || 0) - (item.expenses || 0);
        return (
          <HStack justify="space-between" wrap="wrap" gap={3}>
            <VStack align="start" spacing={0}>
              <Text fontFamily="'Playfair Display', serif" fontSize="md" color="white" fontWeight="600">{item.name}</Text>
              <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">{item.date} {item.location ? `· ${item.location}` : ''}</Text>
              {item.notes && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555" fontStyle="italic" mt={1}>{item.notes}</Text>}
            </VStack>
            <VStack align="end" spacing={0}>
              <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">${parseFloat(item.revenue||0).toFixed(2)} in / ${parseFloat(item.expenses||0).toFixed(2)} out</Text>
              <Text fontFamily="'Playfair Display', serif" fontSize="lg" color={profit >= 0 ? '#7CB97E' : '#e07b7b'} fontWeight="600">${profit.toFixed(2)}</Text>
            </VStack>
          </HStack>
        );
      }}
    />
  );
}
