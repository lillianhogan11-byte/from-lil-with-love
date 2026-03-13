import React, { useState } from 'react';
import { Box, VStack, Input, Button, Text, Heading, FormControl, FormLabel, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { setToken } from './auth';

const inputStyle = { bg: '#1e1e1e', border: '1px solid', borderColor: '#333', borderRadius: '2px', color: 'white', fontFamily: "'Lato', sans-serif", _focus: { borderColor: '#C9A84C', boxShadow: 'none' }, _placeholder: { color: '#555' } };

export default function Login() {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/portal/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      setToken(data.token); navigate('/portal');
    } catch { setError('Something went wrong.'); } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/portal/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      setToken(data.token); navigate('/portal');
    } catch { setError('Something went wrong.'); } finally { setLoading(false); }
  };

  return (
    <Box minH="100vh" bg="#111" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box w="full" maxW="380px">
        <VStack spacing={2} mb={8} textAlign="center">
          <Text fontFamily="'Playfair Display', serif" fontSize="2xl" fontStyle="italic" color="#C9A84C">The Biscuit Bar</Text>
          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#666" letterSpacing="0.15em" textTransform="uppercase">Business Portal</Text>
        </VStack>

        <Box bg="#161616" borderRadius="4px" border="1px solid" borderColor="#222" p={8}>
          <Tabs variant="unstyled" colorScheme="yellow">
            <TabList mb={6} borderBottom="1px solid" borderColor="#222" pb={4}>
              {['Sign In', 'Create Account'].map(label => (
                <Tab key={label} fontFamily="'Lato', sans-serif" fontSize="sm" fontWeight="600" color="#666" _selected={{ color: '#C9A84C', borderBottom: '2px solid #C9A84C' }} pb={2} mr={4}>
                  {label}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <form onSubmit={handleLogin}>
                  <VStack spacing={4}>
                    <FormControl><FormLabel fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" letterSpacing="0.1em" textTransform="uppercase">Email</FormLabel><Input {...inputStyle} type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} /></FormControl>
                    <FormControl><FormLabel fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" letterSpacing="0.1em" textTransform="uppercase">Password</FormLabel><Input {...inputStyle} type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} /></FormControl>
                    {error && <Text color="red.400" fontSize="sm" fontFamily="'Lato', sans-serif">{error}</Text>}
                    <Button type="submit" isLoading={loading} w="full" bg="#C9A84C" color="#111" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" fontSize="sm" py={6} borderRadius="2px" _hover={{ bg: '#b8943d' }}>Sign In</Button>
                  </VStack>
                </form>
              </TabPanel>
              <TabPanel p={0}>
                <form onSubmit={handleRegister}>
                  <VStack spacing={4}>
                    <FormControl><FormLabel fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" letterSpacing="0.1em" textTransform="uppercase">Name</FormLabel><Input {...inputStyle} placeholder="Lily" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} /></FormControl>
                    <FormControl><FormLabel fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" letterSpacing="0.1em" textTransform="uppercase">Email</FormLabel><Input {...inputStyle} type="email" placeholder="you@example.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} /></FormControl>
                    <FormControl><FormLabel fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" letterSpacing="0.1em" textTransform="uppercase">Password</FormLabel><Input {...inputStyle} type="password" placeholder="Choose a strong password" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} /></FormControl>
                    {error && <Text color="red.400" fontSize="sm" fontFamily="'Lato', sans-serif">{error}</Text>}
                    <Button type="submit" isLoading={loading} w="full" bg="#C9A84C" color="#111" fontFamily="'Lato', sans-serif" fontWeight="700" letterSpacing="0.1em" textTransform="uppercase" fontSize="sm" py={6} borderRadius="2px" _hover={{ bg: '#b8943d' }}>Create Account</Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
}
