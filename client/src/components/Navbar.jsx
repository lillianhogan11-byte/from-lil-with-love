import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  VStack,
  Link,
  Container,
  Badge,
  Text,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLink = (href) => {
    onClose();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={scrolled ? 'rgba(242,237,228,0.97)' : 'transparent'}
      backdropFilter={scrolled ? 'blur(8px)' : 'none'}
      boxShadow={scrolled ? 'sm' : 'none'}
      transition="all 0.3s ease"
    >
      <Container maxW="7xl">
        <Flex h="70px" align="center" justify="space-between">
          {/* Wordmark */}
          <Link
            onClick={() => navigate('/')}
            _hover={{ textDecoration: 'none' }}
            cursor="pointer"
          >
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="700"
              color={scrolled ? '#1A0F0A' : 'white'}
              letterSpacing="0.04em"
              transition="color 0.3s ease"
            >
              Biscuit Bar
            </Text>
          </Link>

          {/* Desktop nav */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }} align="center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={location.pathname === '/' ? link.href : undefined}
                onClick={location.pathname !== '/' ? () => handleNavLink(link.href) : undefined}
                fontFamily="Georgia, serif"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color={scrolled ? '#1A0F0A' : 'white'}
                _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                transition="color 0.2s"
                cursor="pointer"
              >
                {link.label}
              </Link>
            ))}

            {/* Cart icon */}
            <Box position="relative" cursor="pointer" onClick={() => navigate('/cart')}>
              <Box fontSize="xl" lineHeight="1">🛍</Box>
              {itemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-6px"
                  right="-8px"
                  bg="#6E2035"
                  color="white"
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="700"
                  minW="18px"
                  textAlign="center"
                  px="4px"
                >
                  {itemCount}
                </Badge>
              )}
            </Box>
          </HStack>

          {/* Mobile: cart + hamburger */}
          <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
            <Box position="relative" cursor="pointer" onClick={() => navigate('/cart')} px={2}>
              <Box fontSize="xl" lineHeight="1">🛍</Box>
              {itemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-4px"
                  right="0px"
                  bg="#6E2035"
                  color="white"
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="700"
                  minW="18px"
                  textAlign="center"
                  px="4px"
                >
                  {itemCount}
                </Badge>
              )}
            </Box>
            <IconButton
              onClick={onOpen}
              icon={<HamburgerIcon w={6} h={6} />}
              variant="ghost"
              aria-label="Open menu"
              color={scrolled ? '#1A0F0A' : 'white'}
              _hover={{ bg: 'transparent', color: '#7C9A7E' }}
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="#F2EDE4">
          <DrawerCloseButton color="#1A0F0A" size="lg" top={4} right={4} />
          <DrawerBody pt={16} px={8}>
            <VStack spacing={8} align="start">
              <Text
                fontFamily="'Playfair Display', serif"
                fontSize="2xl"
                fontWeight="700"
                color="#1A0F0A"
                letterSpacing="0.04em"
                mb={2}
              >
                Biscuit Bar
              </Text>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={location.pathname === '/' ? link.href : undefined}
                  onClick={() => handleNavLink(link.href)}
                  fontFamily="Georgia, serif"
                  fontSize="lg"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color="#1A0F0A"
                  _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                  w="full"
                  cursor="pointer"
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
