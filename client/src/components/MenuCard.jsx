import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  Flex,
  Button,
} from '@chakra-ui/react';
import { useCart } from '../context/CartContext';

export default function MenuCard({ item }) {
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAddToCart() {
    addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Box
      bg="white"
      borderRadius="4px"
      overflow="hidden"
      boxShadow="0 1px 4px rgba(26,26,26,0.07)"
      transition="all 0.25s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(26,26,26,0.12)',
      }}
      cursor="default"
    >
      {/* Image */}
      <Box position="relative" h="200px" overflow="hidden" bg="#F2F2F0">
        {!imgError ? (
          <Image
            src={item.image_url}
            alt={item.name}
            w="full"
            h="full"
            objectFit="cover"
            transition="transform 0.4s ease"
            _groupHover={{ transform: 'scale(1.04)' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Flex h="full" align="center" justify="center">
            <Text fontSize="3xl">🥐</Text>
          </Flex>
        )}
      </Box>

      {/* Content */}
      <VStack align="start" spacing={2} p={4} pb={5}>
        <Heading
          as="h4"
          fontFamily="'Playfair Display', serif"
          fontSize="lg"
          fontWeight="600"
          color="#1A1A1A"
          lineHeight="1.3"
        >
          {item.name}
        </Heading>

        <Text
          fontFamily="'Lato', sans-serif"
          fontSize="sm"
          color="#666"
          lineHeight="1.65"
          noOfLines={3}
        >
          {item.description}
        </Text>

        <Flex w="full" justify="space-between" align="center" pt={1}>
          <Text
            fontFamily="'Playfair Display', serif"
            fontSize="lg"
            fontWeight="600"
            color="#C9A84C"
          >
            ${item.price.toFixed(2)}
          </Text>
          <Button
            size="sm"
            bg={added ? '#7C9A7E' : '#C9A84C'}
            color="#1A1A1A"
            fontFamily="'Lato', sans-serif"
            fontWeight="700"
            fontSize="xs"
            letterSpacing="0.05em"
            px={4}
            _hover={{ bg: added ? '#6a897c' : '#b8943e', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
            onClick={handleAddToCart}
          >
            {added ? 'Added!' : 'Add to Cart'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}
