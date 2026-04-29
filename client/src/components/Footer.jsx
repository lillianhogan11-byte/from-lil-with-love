import React from 'react';
import {
  Box,
  Container,
  Flex,
  Text,
  VStack,
  HStack,
  Link,
  Divider,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <Box id="contact" as="footer" bg="#1A1A1A" color="#FAF7F2">
      <Container maxW="7xl" px={{ base: 4, md: 8 }} py={{ base: 12, md: 16 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 10, md: 8 }}>
          {/* Brand */}
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize="2xl"
              fontWeight="600"
              fontStyle="italic"
              color="white"
            >
              The Biscuit Bar
            </Text>
            <Text
              fontFamily="'Lato', sans-serif"
              fontSize="sm"
              color="whiteAlpha.700"
              lineHeight="1.75"
              textAlign={{ base: 'center', md: 'left' }}
              maxW="260px"
            >
              Scratch-made biscuits with locally sourced ingredients. Coffee, community, and real food — rooted in Franklin, Indiana.
            </Text>
          </VStack>

          {/* Contact */}
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
            <Text
              fontFamily="'Lato', sans-serif"
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.15em"
              textTransform="uppercase"
              color="#7C9A7E"
            >
              Find Us
            </Text>

            <VStack spacing={3} align={{ base: 'center', md: 'flex-start' }}>
              <Link
                href="mailto:lillian@biscuitbar.cafe"
                _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                transition="color 0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={FaEnvelope} color="#7C9A7E" flexShrink={0} />
                  <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="whiteAlpha.800">
                    lillian@biscuitbar.cafe
                  </Text>
                </HStack>
              </Link>

              <Link
                href="https://instagram.com/the.biscuitbar"
                isExternal
                _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                transition="color 0.2s"
              >
                <HStack spacing={3}>
                  <Icon as={FaInstagram} color="#7C9A7E" flexShrink={0} />
                  <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="whiteAlpha.800">
                    @the.biscuitbar
                  </Text>
                </HStack>
              </Link>
            </VStack>
          </VStack>
        </SimpleGrid>

        <Divider borderColor="whiteAlpha.200" mt={12} mb={6} />

        <Flex
          justify={{ base: 'center', md: 'space-between' }}
          align="center"
          flexDirection={{ base: 'column', md: 'row' }}
          gap={2}
        >
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="sm"
            color="whiteAlpha.500"
            textAlign="center"
          >
            © 2026 The Biscuit Bar. Made with 🥐 in Franklin, Indiana.
          </Text>
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="xs"
            color="whiteAlpha.300"
            letterSpacing="0.05em"
          >
            Locally rooted. Community minded.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
}
