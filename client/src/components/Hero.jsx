import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  Container,
} from '@chakra-ui/react';

export default function Hero() {
  const handleMenuClick = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      id="home"
      as="section"
      position="relative"
      minH="100vh"
      display="flex"
      alignItems="center"
      overflow="hidden"
    >
      {/* Background image */}
      <Box
        position="absolute"
        inset={0}
        bgImage="url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: 'rgba(26,26,26,0.48)',
        }}
      />

      {/* Content */}
      <Container maxW="7xl" position="relative" zIndex={1}>
        <VStack
          align={{ base: 'center', md: 'flex-start' }}
          spacing={6}
          maxW={{ base: '100%', md: '600px' }}
          textAlign={{ base: 'center', md: 'left' }}
          px={{ base: 4, md: 0 }}
        >
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="#7C9A7E"
            opacity={0.95}
          >
            Franklin, Indiana
          </Text>

          <Heading
            as="h1"
            fontFamily="'Playfair Display', serif"
            fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
            fontWeight="700"
            lineHeight="1.15"
            color="white"
            letterSpacing="-0.01em"
          >
            The Biscuit Bar<br />
            <Text as="span" fontStyle="italic" color="#F2F2F0">
              Franklin, Indiana
            </Text>
          </Heading>

          <Text
            fontFamily="'Lato', sans-serif"
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight="300"
            color="whiteAlpha.900"
            lineHeight="1.7"
          >
            Scratch-made biscuits. Local ingredients. Real food.
          </Text>

          <Flex gap={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
            <Button
              onClick={handleMenuClick}
              size="lg"
              bg="#C9A84C"
              color="#1A1A1A"
              fontFamily="'Lato', sans-serif"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontSize="sm"
              px={8}
              py={6}
              _hover={{ bg: '#b8943d', transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.25s ease"
              borderRadius="2px"
            >
              See Our Menu
            </Button>

            <Button
              as="a"
              href="#about"
              size="lg"
              variant="outline"
              borderColor="whiteAlpha.700"
              color="white"
              fontFamily="'Lato', sans-serif"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontSize="sm"
              px={8}
              py={6}
              _hover={{ bg: 'whiteAlpha.100', transform: 'translateY(-2px)', borderColor: 'white' }}
              transition="all 0.25s ease"
              borderRadius="2px"
            >
              Our Story
            </Button>
          </Flex>
        </VStack>
      </Container>

      {/* Bottom fade */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="120px"
        bgGradient="linear(to-t, #FAF7F2, transparent)"
      />
    </Box>
  );
}
