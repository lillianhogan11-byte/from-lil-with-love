import React from 'react';
import { Box, Flex, Text, Button, VStack, HStack, Divider, IconButton, Badge } from '@chakra-ui/react';

const GREEN = '#7C9A7E';
const GOLD = '#C9A84C';
const DARK = '#1A1A1A';
const CREAM = '#FAF7F2';

export default function POSCart({
  items,
  onUpdateQty,
  onRemove,
  onClear,
  onPlaceOrder,
  paymentType,
  onPaymentType,
  subtotal,
  tax,
  total,
}) {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Flex direction="column" h="100%" fontFamily="'Lato', sans-serif">
      {/* Cart header */}
      <Flex
        px={5}
        py={4}
        align="center"
        justify="space-between"
        borderBottom="2px solid"
        borderColor="gray.100"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Text fontSize="lg" fontWeight="700" color={DARK} fontFamily="'Playfair Display', serif">
            Order
          </Text>
          {itemCount > 0 && (
            <Badge bg={GREEN} color="white" borderRadius="full" px={2} fontSize="xs">
              {itemCount}
            </Badge>
          )}
        </Flex>
        {items.length > 0 && (
          <Button
            size="xs"
            variant="ghost"
            color="gray.500"
            _hover={{ color: 'red.500' }}
            onClick={onClear}
            fontWeight="500"
          >
            Clear
          </Button>
        )}
      </Flex>

      {/* Items list */}
      <Box flex={1} overflowY="auto" px={4} py={3}>
        {items.length === 0 ? (
          <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
            <Text fontSize="3xl" mb={2}>🛒</Text>
            <Text fontSize="sm">Tap items to add to order</Text>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {items.map((item) => (
              <Box
                key={item.id}
                bg={CREAM}
                borderRadius="lg"
                px={3}
                py={2}
                border="1px solid"
                borderColor="gray.100"
              >
                <Flex justify="space-between" align="flex-start" mb={1}>
                  <Text fontSize="sm" fontWeight="600" color={DARK} flex={1} pr={2} lineHeight="tight">
                    {item.name}
                  </Text>
                  <Text fontSize="sm" fontWeight="700" color={GREEN} whiteSpace="nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Flex>
                <Flex align="center" justify="space-between">
                  <Text fontSize="xs" color="gray.500">
                    ${Number(item.price).toFixed(2)} each
                  </Text>
                  <HStack spacing={1}>
                    <Button
                      size="xs"
                      onClick={() => onUpdateQty(item.id, -1)}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _hover={{ bg: 'gray.100' }}
                      minW="28px"
                      h="28px"
                      px={0}
                      fontSize="lg"
                      lineHeight={1}
                    >
                      −
                    </Button>
                    <Text
                      fontSize="sm"
                      fontWeight="700"
                      color={DARK}
                      minW="24px"
                      textAlign="center"
                    >
                      {item.quantity}
                    </Text>
                    <Button
                      size="xs"
                      onClick={() => onUpdateQty(item.id, 1)}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.300"
                      _hover={{ bg: 'gray.100' }}
                      minW="28px"
                      h="28px"
                      px={0}
                      fontSize="lg"
                      lineHeight={1}
                    >
                      +
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => onRemove(item.id)}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      color="gray.400"
                      _hover={{ bg: 'red.50', borderColor: 'red.300', color: 'red.500' }}
                      minW="28px"
                      h="28px"
                      px={0}
                      fontSize="sm"
                      ml={1}
                    >
                      🗑
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Totals + payment */}
      <Box px={5} py={4} borderTop="2px solid" borderColor="gray.100" flexShrink={0}>
        {/* Totals */}
        <VStack spacing={1} align="stretch" mb={4}>
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.600">Subtotal</Text>
            <Text fontSize="sm" fontWeight="600">${subtotal.toFixed(2)}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text fontSize="sm" color="gray.600">Tax (7% IN)</Text>
            <Text fontSize="sm" fontWeight="600">${tax.toFixed(2)}</Text>
          </Flex>
          <Divider my={1} />
          <Flex justify="space-between">
            <Text fontSize="lg" fontWeight="700" color={DARK} fontFamily="'Playfair Display', serif">
              Total
            </Text>
            <Text fontSize="xl" fontWeight="800" color={GREEN}>
              ${total.toFixed(2)}
            </Text>
          </Flex>
        </VStack>

        {/* Payment type */}
        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={2}>
          Payment
        </Text>
        <HStack spacing={3} mb={4}>
          {['Cash', 'Card'].map((type) => (
            <Button
              key={type}
              flex={1}
              size="md"
              onClick={() => onPaymentType(type)}
              bg={paymentType === type ? GOLD : 'white'}
              color={paymentType === type ? DARK : 'gray.600'}
              border="2px solid"
              borderColor={paymentType === type ? GOLD : 'gray.300'}
              fontWeight="700"
              _hover={{
                bg: paymentType === type ? GOLD : 'gray.50',
                borderColor: GOLD,
              }}
            >
              {type === 'Cash' ? '💵 Cash' : '💳 Card'}
            </Button>
          ))}
        </HStack>

        {/* Place order */}
        <Button
          w="100%"
          size="lg"
          bg={items.length > 0 ? GREEN : 'gray.200'}
          color={items.length > 0 ? 'white' : 'gray.400'}
          fontFamily="'Playfair Display', serif"
          fontSize="lg"
          fontWeight="700"
          py={7}
          borderRadius="xl"
          _hover={items.length > 0 ? { bg: '#6a8a6c', transform: 'scale(1.01)' } : {}}
          _active={items.length > 0 ? { transform: 'scale(0.98)' } : {}}
          onClick={onPlaceOrder}
          isDisabled={items.length === 0}
          cursor={items.length === 0 ? 'not-allowed' : 'pointer'}
        >
          Place Order
        </Button>
      </Box>
    </Flex>
  );
}
