import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  HStack,
  IconButton,
  VStack,
  Collapse,
  useDisclosure,
  Link,
  Container,
  Badge,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Menu', href: '#menu' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
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
      bg={scrolled ? 'rgba(250,247,242,0.97)' : 'transparent'}
      backdropFilter={scrolled ? 'blur(8px)' : 'none'}
      boxShadow={scrolled ? 'sm' : 'none'}
      transition="all 0.3s ease"
    >
      <Container maxW="7xl">
        <Flex h="70px" align="center" justify="space-between">
          {/* Logo */}
          <Link
            onClick={() => navigate('/')}
            _hover={{ textDecoration: 'none' }}
            cursor="pointer"
          >
            <Text
              fontFamily="'Playfair Display', serif"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="600"
              fontStyle="italic"
              color="#1A1A1A"
              letterSpacing="0.02em"
            >
              The Biscuit Bar
            </Text>
          </Link>

          {/* Desktop nav */}
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }} align="center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={location.pathname === '/' ? link.href : undefined}
                onClick={location.pathname !== '/' ? () => handleNavLink(link.href) : undefined}
                fontFamily="'Lato', sans-serif"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="#1A1A1A"
                _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                transition="color 0.2s"
                cursor="pointer"
              >
                {link.label}
              </Link>
            ))}

            {/* Cart icon */}
            <Box position="relative" cursor="pointer" onClick={() => navigate('/cart')}>
              <Text fontSize="xl" lineHeight="1">🛍</Text>
              {itemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-6px"
                  right="-8px"
                  bg="#C9A84C"
                  color="#1A1A1A"
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
              <Text fontSize="xl" lineHeight="1">🛍</Text>
              {itemCount > 0 && (
                <Badge
                  position="absolute"
                  top="-4px"
                  right="0px"
                  bg="#C9A84C"
                  color="#1A1A1A"
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
              onClick={onToggle}
              icon={isOpen ? <CloseIcon w={4} h={4} /> : <HamburgerIcon w={6} h={6} />}
              variant="ghost"
              aria-label="Toggle menu"
              color="#1A1A1A"
              _hover={{ bg: 'transparent', color: '#7C9A7E' }}
            />
          </HStack>
        </Flex>

        {/* Mobile menu */}
        <Collapse in={isOpen} animateOpacity>
          <VStack
            bg="#FAF7F2"
            px={4}
            pb={6}
            pt={2}
            spacing={4}
            align="start"
            borderTop="1px solid"
            borderColor="#F2F2F0"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={location.pathname === '/' ? link.href : undefined}
                onClick={() => { onToggle(); if (location.pathname !== '/') handleNavLink(link.href); }}
                fontFamily="'Lato', sans-serif"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.1em"
                textTransform="uppercase"
                color="#1A1A1A"
                _hover={{ color: '#7C9A7E', textDecoration: 'none' }}
                w="full"
                py={1}
                cursor="pointer"
              >
                {link.label}
              </Link>
            ))}
          </VStack>
        </Collapse>
      </Container>
    </Box>
  );
}
