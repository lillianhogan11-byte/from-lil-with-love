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
import Logo from './Logo';

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
        bgImage="url('/hero-biscuits.webp')"
        bgSize="cover"
        bgPosition="center 35%"
        bgRepeat="no-repeat"
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bg: 'rgba(26,15,10,0.52)',
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
          <Logo size="lg" darkBg={false} />

          <Text
            fontFamily="Georgia, serif"
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
              bg="#6E2035"
              color="white"
              fontFamily="Georgia, serif"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              fontSize="sm"
              px={8}
              py={6}
              _hover={{ bg: '#5A1929', transform: 'translateY(-2px)', boxShadow: 'lg' }}
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
              fontFamily="Georgia, serif"
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
        bgGradient="linear(to-t, #F2EDE4, transparent)"
      />
    </Box>
  );
}
