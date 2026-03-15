import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  Button,
  VStack,
  Spinner,
  Center,
  Badge,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import MenuCard from './MenuCard';
import { apiFetch } from '../api';

const CATEGORY_ORDER = ['Biscuits', 'Biscuit Sandwiches', 'Biscuits & Spreads', 'Biscuits & Gravy', 'Coffee & Espresso'];

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: menuData = {}, isLoading, error } = useQuery({
    queryKey: ['menu'],
    queryFn: () => apiFetch('/api/menu'),
    staleTime: 1000 * 60 * 10,
  });

  const categories = ['All', ...CATEGORY_ORDER.filter((c) => menuData[c])];

  const visibleItems =
    activeCategory === 'All'
      ? CATEGORY_ORDER.flatMap((cat) => menuData[cat] || [])
      : menuData[activeCategory] || [];

  return (
    <Box id="menu" as="section" py={{ base: 16, md: 24 }} bg="#FAF7F2">
      <Container maxW="7xl" px={{ base: 4, md: 8 }}>
        {/* Section header */}
        <VStack spacing={3} mb={{ base: 10, md: 14 }} textAlign="center">
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.2em"
            textTransform="uppercase"
            color="#7C9A7E"
          >
            Fresh Daily
          </Text>
          <Heading
            as="h2"
            fontFamily="'Playfair Display', serif"
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="700"
            color="#1A1A1A"
            lineHeight="1.2"
          >
            Our Menu
          </Heading>
          <Text
            fontFamily="'Lato', sans-serif"
            fontSize="md"
            color="#555"
            maxW="480px"
            lineHeight="1.8"
          >
            Everything is made in small batches each morning. When it&apos;s gone, it&apos;s gone.
          </Text>
        </VStack>

        {/* Category filter */}
        {!isLoading && !error && (
          <HStack
            spacing={2}
            mb={10}
            overflowX="auto"
            pb={2}
            justify={{ base: 'flex-start', md: 'center' }}
            css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          >
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                size="sm"
                variant={activeCategory === cat ? 'solid' : 'outline'}
                bg={activeCategory === cat ? '#7C9A7E' : 'transparent'}
                color={activeCategory === cat ? 'white' : '#1A1A1A'}
                borderColor={activeCategory === cat ? '#7C9A7E' : '#ccc'}
                fontFamily="'Lato', sans-serif"
                fontWeight="700"
                letterSpacing="0.06em"
                fontSize="xs"
                textTransform="uppercase"
                px={5}
                py={5}
                borderRadius="2px"
                flexShrink={0}
                _hover={{
                  bg: activeCategory === cat ? '#6a897c' : '#F2F2F0',
                  borderColor: '#7C9A7E',
                }}
                transition="all 0.2s"
              >
                {cat}
              </Button>
            ))}
          </HStack>
        )}

        {/* Loading */}
        {isLoading && (
          <Center py={20}>
            <VStack spacing={4}>
              <Spinner size="xl" color="#7C9A7E" thickness="3px" />
              <Text fontFamily="'Lato', sans-serif" color="#888">
                Loading today&apos;s menu…
              </Text>
            </VStack>
          </Center>
        )}

        {/* Error */}
        {error && (
          <Center py={20}>
            <Text fontFamily="'Lato', sans-serif" color="#888">
              Couldn&apos;t load the menu right now. Please check back soon.
            </Text>
          </Center>
        )}

        {/* Menu grid */}
        {!isLoading && !error && (
          <>
            {activeCategory === 'All' ? (
              CATEGORY_ORDER.filter((cat) => menuData[cat]).map((cat) => (
                <Box key={cat} mb={14}>
                  <HStack mb={6} align="center" spacing={4}>
                    <Heading
                      as="h3"
                      fontFamily="'Playfair Display', serif"
                      fontSize={{ base: '2xl', md: '3xl' }}
                      fontWeight="600"
                      fontStyle="italic"
                      color="#1A1A1A"
                    >
                      {cat}
                    </Heading>
                    <Box flex={1} h="1px" bg="#e0ddd8" />
                  </HStack>
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
                    spacing={{ base: 4, md: 6 }}
                  >
                    {menuData[cat].map((item) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </SimpleGrid>
                </Box>
              ))
            ) : (
              <SimpleGrid
                columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
                spacing={{ base: 4, md: 6 }}
              >
                {visibleItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
