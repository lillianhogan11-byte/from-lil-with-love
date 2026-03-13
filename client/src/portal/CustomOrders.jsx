import React from 'react';
import { Text, HStack, VStack, Badge } from '@chakra-ui/react';
import SimpleList from './SimpleList';

const STATUS_COLORS = { pending: '#C9A84C', confirmed: '#7CB97E', completed: '#555', cancelled: '#e07b7b' };

export default function CustomOrders() {
  return (
    <SimpleList
      title="Custom Orders"
      endpoint="/portal/api/custom-orders"
      fields={[
        { key: 'customer_name', label: 'Customer Name', required: true },
        { key: 'customer_phone', label: 'Phone', type: 'tel' },
        { key: 'customer_email', label: 'Email', type: 'email' },
        { key: 'description', label: 'Order Description', type: 'textarea', required: true, placeholder: '2-tier birthday cake, chocolate...' },
        { key: 'total', label: 'Total ($)', type: 'number' },
        { key: 'deposit', label: 'Deposit ($)', type: 'number' },
        { key: 'due_date', label: 'Due Date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
      formatRow={item => (
        <HStack justify="space-between" wrap="wrap" gap={3}>
          <VStack align="start" spacing={1}>
            <HStack>
              <Text fontFamily="'Playfair Display', serif" fontSize="md" color="white" fontWeight="600">{item.customer_name}</Text>
              <Badge bg="#1e1e1e" color={STATUS_COLORS[item.status] || '#888'} borderRadius="2px" fontSize="10px" textTransform="uppercase">{item.status}</Badge>
            </HStack>
            <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#ccc">{item.description}</Text>
            <HStack spacing={3} wrap="wrap">
              {item.customer_phone && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">📞 {item.customer_phone}</Text>}
              {item.due_date && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">📅 Due: {item.due_date}</Text>}
              {item.deposit > 0 && <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#7C9A7E">Deposit: ${parseFloat(item.deposit).toFixed(2)}</Text>}
            </HStack>
          </VStack>
          {item.total > 0 && <Text fontFamily="'Playfair Display', serif" fontSize="xl" color="#C9A84C" fontWeight="600">${parseFloat(item.total).toFixed(2)}</Text>}
        </HStack>
      )}
    />
  );
}
