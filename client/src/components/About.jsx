import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';

export default function About() {
  return (
    <Box id="about" as="section" py={{ base: 16, md: 24 }} bg="#F2F2F0">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 12, md: 16 }} alignItems="center">
          {/* Left: image */}
          <Box
            position="relative"
            borderRadius="4px"
            overflow="hidden"
            h={{ base: '320px', md: '520px' }}
            boxShadow="0 4px 24px rgba(26,26,26,0.12)"
          >
            <Image
              src="/about-process.webp"
              alt="Biscuit dough being cut by hand in the kitchen"
              w="full"
              h="full"
              objectFit="cover"
            />
            {/* Overlay card */}
            <Box
              position="absolute"
              bottom={6}
              left={6}
              right={6}
              bg="rgba(250,247,242,0.93)"
              backdropFilter="blur(4px)"
              p={4}
              borderRadius="2px"
            >
              <HStack spacing={3} align="center">
                <Box w="3px" h="40px" bg="#7C9A7E" flexShrink={0} />
                <Text
                  fontFamily="'Lato', sans-serif"
                  fontSize="xs"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="#7C9A7E"
                  lineHeight="1.6"
                >
                  A portion of every sale goes to<br />
                  local charities that build communities
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Right: text */}
          <VStack align="start" spacing={6}>
            <Text
              fontFamily="'Lato', sans-serif"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="#7C9A7E"
            >
              Our Philosophy
            </Text>

            <Heading
              as="h2"
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: '3xl', md: '4xl', lg: '4xl' }}
              fontWeight="700"
              color="#1A1A1A"
              lineHeight="1.25"
            >
              Food Is More<br />
              <Text as="span" fontStyle="italic">Than Fuel</Text>
            </Heading>

            <Divider borderColor="#ccc" />

            <VStack spacing={5} align="start">
              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="md"
                color="#444"
                lineHeight="1.85"
              >
                We've become disconnected from the food we eat. Manufactured in a factory, pumped with shelf-stable ingredients for preservation, we prioritize convenience over health. Biscuit Bar was created to disrupt the norm — fresh, homemade biscuits that you can grab on the go while knowing the food you and your family eat is made with real ingredients, sourced locally and organically whenever possible. Creatively crafted with unique combinations that keep you coming back, Biscuit Bar supports Johnson County farmers and families.
              </Text>

              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="md"
                color="#444"
                lineHeight="1.85"
              >
                Our biscuits are the foundation of everything on the menu, and that foundation is built on real ingredients from real people in this community.
              </Text>

              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="md"
                color="#444"
                lineHeight="1.85"
              >
                A portion of every sale at Biscuit Bar goes directly to local charities that help build communities and save lives — from food pantries and youth programs to animal shelters right here in Johnson County. We believe the best businesses are rooted in love. When you order a biscuit from us, you are feeding yourself and feeding your neighbors. Food made with intention nourishes more than just the body. It feeds the soul of a community.
              </Text>
            </VStack>

            {/* Stats */}
            <SimpleGrid columns={3} spacing={6} pt={4} w="full">
              {[
                { value: '100%', label: 'Locally Sourced' },
                { value: '5+', label: 'Farm Partners' },
                { value: '10%', label: 'To Charity' },
              ].map(({ value, label }) => (
                <VStack key={label} spacing={1} align="start">
                  <Text
                    fontFamily="'Playfair Display', serif"
                    fontSize={{ base: '2xl', md: '3xl' }}
                    fontWeight="700"
                    color="#7C9A7E"
                  >
                    {value}
                  </Text>
                  <Text
                    fontFamily="'Lato', sans-serif"
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="#888"
                  >
                    {label}
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
