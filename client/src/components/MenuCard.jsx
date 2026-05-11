import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  Flex,
} from '@chakra-ui/react';

export default function MenuCard({ item }) {
  const [imgError, setImgError] = useState(false);

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

        {(() => {
          const parts = (item.description || '').split(/\n+Suggested pairing:/i);
          const mainDesc = parts[0].trim();
          const pairing = parts[1] ? parts[1].trim() : null;
          return (
            <>
              <Text
                fontFamily="'Lato', sans-serif"
                fontSize="sm"
                color="#666"
                lineHeight="1.65"
              >
                {mainDesc}
              </Text>
              {pairing && (
                <Text
                  fontFamily="'Lato', sans-serif"
                  fontSize="xs"
                  color="#7C9A7E"
                  lineHeight="1.6"
                  fontStyle="italic"
                >
                  Suggested pairing: {pairing}
                </Text>
              )}
            </>
          );
        })()}


      </VStack>
    </Box>
  );
}
