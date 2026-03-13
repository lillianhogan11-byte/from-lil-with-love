import React from 'react';
import { Text, HStack, VStack } from '@chakra-ui/react';
import SimpleList from './SimpleList';

export default function Mileage() {
  return (
    <SimpleList
      title="Mileage Log"
      endpoint="/portal/api/mileage"
      fields={[
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'origin', label: 'From', placeholder: 'Starting location' },
        { key: 'destination', label: 'To', placeholder: 'Destination' },
        { key: 'miles', label: 'Miles', type: 'number', placeholder: '0.0', required: true },
        { key: 'purpose', label: 'Purpose', placeholder: "Farmers market, supply run..." },
      ]}
      formatRow={item => (
        <HStack justify="space-between" wrap="wrap" gap={3}>
          <VStack align="start" spacing={0}>
            <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="white">{item.origin} → {item.destination}</Text>
            <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">{item.date} · {item.purpose}</Text>
          </VStack>
          <VStack align="end" spacing={0}>
            <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="#C9A84C" fontWeight="600">{parseFloat(item.miles).toFixed(1)} mi</Text>
            <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555">${(item.miles * 0.67).toFixed(2)} deductible</Text>
          </VStack>
        </HStack>
      )}
    />
  );
}
