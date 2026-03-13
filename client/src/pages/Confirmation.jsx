import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, Flex, Divider } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Confirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order, name, pickupTime } = state || {};

  if (!order) {
    return (
      <Box minH="80vh" bg="#FAF7F2" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4} textAlign="center">
          <Text fontFamily="'Playfair Display', serif" fontSize="2xl">Nothing to show here.</Text>
          <Button onClick={() => navigate('/')} bg="#C9A84C" color="#1A1A1A" borderRadius="2px" _hover={{ bg: '#b8943d' }}>Go Home</Button>
        </VStack>
      </Box>
    );
  }

  const items = JSON.parse(order.items || '[]');

  return (
    <Box minH="80vh" bg="#FAF7F2" pt={{ base: 24, md: 32 }} pb={16}>
      <Container maxW="lg">
        <VStack spacing={6} textAlign="center" mb={10}>
          <Text fontSize="5xl">✅</Text>
          <Heading fontFamily="'Playfair Display', serif" fontSize={{ base: '2xl', md: '3xl' }} color="#1A1A1A">
            Order placed, {name}!
          </Heading>
          <Text fontFamily="'Lato', sans-serif" color="#555" fontSize="md" maxW="sm">
            We'll have everything ready for you. Just swing by and pay when you pick up.
          </Text>
          <Box bg="#7C9A7E" color="white" px={6} py={3} borderRadius="2px">
            <Text fontFamily="'Lato', sans-serif" fontWeight="700" fontSize="sm" letterSpacing="0.05em">
              PICKUP: {pickupTime}
            </Text>
          </Box>
        </VStack>

        <Box bg="white" borderRadius="4px" p={6} boxShadow="0 1px 4px rgba(26,26,26,0.07)">
          <Text fontFamily="'Playfair Display', serif" fontWeight="600" mb={4} color="#1A1A1A">Your Items</Text>
          <VStack spacing={2} align="stretch">
            {items.map((item, idx) => (
              <Flex key={idx} justify="space-between" fontFamily="'Lato', sans-serif" fontSize="sm">
                <Text color="#444">{item.name} × {item.quantity}</Text>
                <Text fontWeight="600">${(item.price * item.quantity).toFixed(2)}</Text>
              </Flex>
            ))}
          </VStack>
          <Divider borderColor="#E8E4DE" my={4} />
          <Flex justify="space-between" fontFamily="'Playfair Display', serif">
            <Text fontWeight="600">Total due at pickup</Text>
            <Text fontWeight="600" color="#C9A84C">${parseFloat(order.total).toFixed(2)}</Text>
          </Flex>
        </Box>

        <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#888" textAlign="center" mt={6} mb={8}>
          Questions? Call or text us and we'll sort it out. 🥐
        </Text>

        <Button
          w="full" size="lg"
          bg="#1A1A1A" color="white"
          fontFamily="'Lato', sans-serif" fontWeight="700"
          letterSpacing="0.08em" textTransform="uppercase" fontSize="sm"
          py={7} borderRadius="2px"
          _hover={{ bg: '#333' }}
          onClick={() => navigate('/')}
        >
          Start a New Order
        </Button>
      </Container>
    </Box>
  );
}
