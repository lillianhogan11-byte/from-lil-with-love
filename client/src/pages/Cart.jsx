import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, HStack, Image, Flex, Divider } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <Box minH="80vh" bg="#FAF7F2" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} textAlign="center" px={4}>
          <Text fontSize="4xl">🥐</Text>
          <Heading fontFamily="'Playfair Display', serif" fontSize="2xl" color="#1A1A1A">
            Your cart is empty
          </Heading>
          <Text color="#666" fontFamily="'Lato', sans-serif">
            Nothing here yet — head back to the menu and add something delicious.
          </Text>
          <Button
            onClick={() => navigate('/#menu')}
            bg="#C9A84C" color="#1A1A1A"
            fontFamily="'Lato', sans-serif" fontWeight="700"
            letterSpacing="0.08em" textTransform="uppercase" fontSize="sm"
            px={8} py={6}
            _hover={{ bg: '#b8943d' }}
            borderRadius="2px"
          >
            View Menu
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="80vh" bg="#FAF7F2" pt={{ base: 24, md: 32 }} pb={16}>
      <Container maxW="2xl">
        <Heading fontFamily="'Playfair Display', serif" fontSize={{ base: '2xl', md: '3xl' }} mb={8} color="#1A1A1A">
          Your Order
        </Heading>

        <VStack spacing={4} align="stretch" mb={8}>
          {items.map(item => (
            <Box key={item.id} bg="white" borderRadius="4px" p={4} boxShadow="0 1px 4px rgba(26,26,26,0.07)">
              <HStack spacing={4} align="start">
                <Image
                  src={item.image_url} alt={item.name}
                  w="64px" h="64px" objectFit="cover" borderRadius="2px" flexShrink={0}
                  fallback={<Box w="64px" h="64px" bg="#F2F2F0" borderRadius="2px" display="flex" alignItems="center" justifyContent="center"><Text>🥐</Text></Box>}
                />
                <Box flex={1}>
                  <Text fontFamily="'Playfair Display', serif" fontWeight="600" color="#1A1A1A" fontSize="md">
                    {item.name}
                  </Text>
                  <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#C9A84C" fontWeight="600" mt={0.5}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Box>
                <VStack spacing={2} align="end">
                  <HStack spacing={2}>
                    <Button size="xs" variant="outline" borderColor="#E0E0E0" onClick={() => updateQuantity(item.id, item.quantity - 1)} minW="28px">−</Button>
                    <Text fontFamily="'Lato', sans-serif" fontWeight="600" minW="20px" textAlign="center">{item.quantity}</Text>
                    <Button size="xs" variant="outline" borderColor="#E0E0E0" onClick={() => updateQuantity(item.id, item.quantity + 1)} minW="28px">+</Button>
                  </HStack>
                  <Button size="xs" variant="ghost" color="#999" fontFamily="'Lato', sans-serif" onClick={() => removeItem(item.id)} _hover={{ color: '#e53e3e' }}>
                    Remove
                  </Button>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>

        <Divider borderColor="#E8E4DE" mb={6} />

        <Flex justify="space-between" align="center" mb={8}>
          <Text fontFamily="'Playfair Display', serif" fontSize="xl" fontWeight="600" color="#1A1A1A">Total</Text>
          <Text fontFamily="'Playfair Display', serif" fontSize="xl" fontWeight="600" color="#C9A84C">${total.toFixed(2)}</Text>
        </Flex>

        <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888" mb={6} textAlign="center">
          Pay when you pick up — no payment required online.
        </Text>

        <Button
          w="full" size="lg"
          bg="#1A1A1A" color="white"
          fontFamily="'Lato', sans-serif" fontWeight="700"
          letterSpacing="0.08em" textTransform="uppercase" fontSize="sm"
          py={7} borderRadius="2px"
          _hover={{ bg: '#333' }}
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>
      </Container>
    </Box>
  );
}
