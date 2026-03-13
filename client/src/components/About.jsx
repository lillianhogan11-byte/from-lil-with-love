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
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80"
              alt="Hands tending a garden with fresh herbs and vegetables"
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
                There is something profound about knowing where your food comes from — the hands that tended the soil, the sun and rain that fed the roots, the care that carried each ingredient from the earth to your table. At The Biscuit Bar, we believe that relationship with your food is not a luxury. It is a birthright. Every biscuit we bake is made with ingredients grown locally and organically, because what nourishes the land ultimately nourishes us.
              </Text>

              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="md"
                color="#444"
                lineHeight="1.85"
              >
                Every biscuit we make incorporates something grown right here — fresh herbs from local farms, flour from a regional mill, raw honey from hives just down the road. Our biscuits are the foundation of everything on the menu, and that foundation is built on real ingredients from real people in this community. This isn&apos;t a marketing story. It&apos;s the only way we know how to bake.
              </Text>

              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="md"
                color="#444"
                lineHeight="1.85"
              >
                A portion of every sale at The Biscuit Bar goes directly to local charities that help build communities and save lives — from food pantries and youth programs to mental health initiatives right here in Johnson County. We believe business can be an act of love. When you order a biscuit from us, you are feeding yourself and feeding your neighbors. Food made with intention nourishes more than just the body. It feeds the soul of a community.
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
