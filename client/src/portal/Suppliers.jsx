import React from 'react';
import { Text, VStack, HStack } from '@chakra-ui/react';
import SimpleList from './SimpleList';

export default function Suppliers() {
  return (
    <SimpleList
      title="Suppliers"
      endpoint="/portal/api/suppliers"
      fields={[
        { key: 'name', label: 'Supplier Name', required: true, placeholder: "Local Farm Co." },
        { key: 'contact_name', label: 'Contact Name', placeholder: 'Person to call' },
        { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 555-5555' },
        { key: 'email', label: 'Email', type: 'email', placeholder: 'supplier@email.com' },
        { key: 'address', label: 'Address', placeholder: 'Street address' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'What you buy, pricing notes...' },
      ]}
      formatRow={item => (
        <VStack align="start" spacing={1}>
          <Text fontFamily="'Playfair Display', serif" fontSize="md" color="white" fontWeight="600">{item.name}</Text>
          <HStack spacing={4} wrap="wrap">
            {item.contact_name && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888">👤 {item.contact_name}</Text>}
            {item.phone && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888">📞 {item.phone}</Text>}
            {item.email && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888">✉️ {item.email}</Text>}
          </HStack>
          {item.notes && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#555" fontStyle="italic">{item.notes}</Text>}
        </VStack>
      )}
    />
  );
}
