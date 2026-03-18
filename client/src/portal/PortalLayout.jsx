import React, { useState } from 'react';
import { Box, Flex, Text, VStack, HStack, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, useDisclosure, Badge } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearToken } from './auth';

const NAV = [
  { label: '📊 Dashboard', path: '/portal' },
  { label: '📦 Orders', path: '/portal/orders' },
  { label: '✏️ Custom Orders', path: '/portal/custom-orders' },
  { label: '💰 Income', path: '/portal/income' },
  { label: '🧾 Expenses', path: '/portal/expenses' },
  { label: '🧪 Recipes', path: '/portal/recipes' },
  { label: '📋 Inventory', path: '/portal/inventory' },
  { label: '🏪 Events', path: '/portal/events' },
  { label: '🚗 Mileage', path: '/portal/mileage' },
  { label: '🤝 Suppliers', path: '/portal/suppliers' },
  { label: '🍞 Menu', path: '/portal/menu' },
  { label: '📁 Tax Export', path: '/portal/taxes' },
];

function SidebarContent({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { clearToken(); navigate('/portal/login'); };

  return (
    <VStack align="stretch" spacing={0} h="100%">
      <Box px={6} py={5} borderBottom="1px solid" borderColor="#2a2a2a">
        <Text fontFamily="Georgia, serif" fontSize="lg" fontWeight="bold" color="#6E2035">Biscuit Bar</Text>
        <Text fontFamily="Georgia, serif" fontSize="xs" color="#B8A99A" letterSpacing="0.1em" textTransform="uppercase" mt={0.5}>Business Portal</Text>
      </Box>
      <VStack align="stretch" spacing={0} flex={1} overflowY="auto" py={3}>
        {NAV.map(item => {
          const active = location.pathname === item.path;
          return (
            <Box
              key={item.path}
              px={6} py={3} cursor="pointer"
              bg={active ? '#1e1e1e' : 'transparent'}
              borderLeft={active ? '3px solid #6E2035' : '3px solid transparent'}
              onClick={() => { navigate(item.path); onClose?.(); }}
              _hover={{ bg: '#1a1a1a' }}
              transition="all 0.15s"
            >
              <Text fontFamily="Georgia, serif" fontSize="sm" color={active ? '#6E2035' : '#ccc'} fontWeight={active ? '600' : '400'}>
                {item.label}
              </Text>
            </Box>
          );
        })}
      </VStack>
      <Box px={6} py={4} borderTop="1px solid" borderColor="#2a2a2a">
        <Text fontFamily="Georgia, serif" fontSize="sm" color="#666" cursor="pointer" _hover={{ color: '#6E2035' }} onClick={handleLogout}>
          → Sign Out
        </Text>
      </Box>
    </VStack>
  );
}

export default function PortalLayout({ children, title }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="#111" color="white">
      {/* Desktop sidebar */}
      <Box w="240px" bg="#161616" display={{ base: 'none', lg: 'flex' }} flexDirection="column" position="fixed" h="100vh" borderRight="1px solid" borderColor="#222">
        <SidebarContent />
      </Box>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="#161616" color="white" maxW="240px">
          <DrawerHeader p={0}><SidebarContent onClose={onClose} /></DrawerHeader>
          <DrawerBody p={0} />
        </DrawerContent>
      </Drawer>

      {/* Main content */}
      <Box flex={1} ml={{ base: 0, lg: '240px' }} minH="100vh">
        {/* Mobile topbar */}
        <Flex display={{ base: 'flex', lg: 'none' }} bg="#161616" px={4} py={3} align="center" justify="space-between" borderBottom="1px solid" borderColor="#222" position="sticky" top={0} zIndex={100}>
          <Text fontFamily="Georgia, serif" fontSize="md" fontWeight="bold" color="#6E2035">Biscuit Bar</Text>
          <Text cursor="pointer" fontSize="xl" onClick={onOpen}>☰</Text>
        </Flex>

        <Box p={{ base: 4, md: 8 }}>
          {title && (
            <Text fontFamily="Georgia, serif" fontSize={{ base: 'xl', md: '2xl' }} fontWeight="600" color="white" mb={6}>
              {title}
            </Text>
          )}
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
