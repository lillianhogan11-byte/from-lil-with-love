import React from 'react';
import { Text, HStack, VStack, Badge } from '@chakra-ui/react';
import SimpleList from './SimpleList';

export default function Recipes() {
  return (
    <SimpleList
      title="Recipe Cost Calculator"
      endpoint="/portal/api/recipes"
      fields={[
        { key: 'name', label: 'Recipe Name', required: true, placeholder: 'e.g. Sourdough Loaf' },
        { key: 'ingredient_cost', label: 'Total Ingredient Cost ($)', type: 'number', placeholder: '0.00' },
        { key: 'batch_yield', label: 'Units per Batch', type: 'number', placeholder: 'e.g. 12' },
        { key: 'selling_price', label: 'Selling Price per Unit ($)', type: 'number', placeholder: '0.00' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional' },
      ]}
      formatRow={item => {
        const margin = parseFloat(item.margin_percent || 0);
        const marginColor = margin >= 60 ? '#7CB97E' : margin >= 40 ? '#C9A84C' : '#e07b7b';
        return (
          <HStack justify="space-between" wrap="wrap" gap={3}>
            <VStack align="start" spacing={1}>
              <Text fontFamily="'Playfair Display', serif" fontSize="md" color="white" fontWeight="600">{item.name}</Text>
              <HStack spacing={3} wrap="wrap">
                <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">Batch cost: ${parseFloat(item.ingredient_cost||0).toFixed(2)}</Text>
                <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">Yield: {item.batch_yield} units</Text>
                <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">Cost/unit: ${parseFloat(item.cost_per_unit||0).toFixed(2)}</Text>
              </HStack>
            </VStack>
            <HStack spacing={3}>
              <VStack align="end" spacing={0}>
                <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">Sell price</Text>
                <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="#C9A84C">${parseFloat(item.selling_price||0).toFixed(2)}</Text>
              </VStack>
              <VStack align="end" spacing={0}>
                <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666">Margin</Text>
                <Text fontFamily="'Playfair Display', serif" fontSize="lg" color={marginColor}>{margin.toFixed(0)}%</Text>
              </VStack>
            </HStack>
          </HStack>
        );
      }}
    />
  );
}
