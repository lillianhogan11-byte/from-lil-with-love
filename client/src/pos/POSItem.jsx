import React from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';

const GREEN = '#7C9A7E';
const GOLD = '#C9A84C';
const DARK = '#1A1A1A';

export default function POSItem({ item, onAdd }) {
  return (
    <Box
      as="button"
      onClick={() => onAdd(item)}
      bg="white"
      border="2px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={4}
      textAlign="left"
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ borderColor: GREEN, transform: 'scale(1.02)', boxShadow: 'md' }}
      _active={{ transform: 'scale(0.97)', bg: 'gray.50' }}
      w="100%"
      minH="90px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Text
        fontFamily="'Lato', sans-serif"
        fontWeight="600"
        fontSize="sm"
        color={DARK}
        lineHeight="tight"
        noOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        fontFamily="'Playfair Display', serif"
        fontWeight="bold"
        fontSize="lg"
        color={GREEN}
        mt={2}
      >
        ${Number(item.price).toFixed(2)}
      </Text>
    </Box>
  );
}
