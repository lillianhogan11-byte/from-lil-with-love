import React, { useState } from 'react';
import { Box, Text, VStack, Button, Select, HStack } from '@chakra-ui/react';
import PortalLayout from './PortalLayout';
import { portalFetch, getToken } from './auth';

export default function TaxExport() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(year));

  const handleExport = () => {
    const token = getToken();
    const url = `/portal/api/taxes/export?year=${selectedYear}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `flwl-taxes-${selectedYear}.csv`;
    // Fetch with auth header
    portalFetch(url).then(r => r.blob()).then(blob => {
      const burl = URL.createObjectURL(blob);
      a.href = burl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(burl);
    });
  };

  return (
    <PortalLayout title="Tax Export">
      <Box bg="#1a1a1a" border="1px solid" borderColor="#222" borderRadius="4px" p={8} maxW="480px">
        <VStack spacing={6} align="stretch">
          <VStack align="start" spacing={1}>
            <Text fontFamily="'Playfair Display', serif" fontSize="lg" color="white">Export for your CPA</Text>
            <Text fontFamily="'Lato', sans-serif" fontSize="sm" color="#666">
              Downloads a CSV with all income, expenses, and mileage for the selected year — formatted for Schedule C.
            </Text>
          </VStack>

          <Box>
            <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#888" mb={2} textTransform="uppercase" letterSpacing="0.1em">Tax Year</Text>
            <Select
              bg="#111" border="1px solid" borderColor="#333" borderRadius="2px" color="white"
              fontFamily="'Lato', sans-serif" size="sm" value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              _focus={{ borderColor: '#C9A84C', boxShadow: 'none' }}
            >
              {[year, year-1, year-2].map(y => <option key={y} value={String(y)}>{y}</option>)}
            </Select>
          </Box>

          <Button
            onClick={handleExport}
            bg="#C9A84C" color="#111"
            fontFamily="'Lato', sans-serif" fontWeight="700"
            letterSpacing="0.08em" textTransform="uppercase" fontSize="sm"
            borderRadius="2px" py={6}
            _hover={{ bg: '#b8943d' }}
          >
            Download {selectedYear} Tax Summary
          </Button>

          <Text fontFamily="'Lato', sans-serif" fontSize="xs" color="#444">
            Includes: all income by source, categorized expenses with deductibility flags, mileage log with standard rate deduction (67¢/mi for 2024), and net profit summary.
          </Text>
        </VStack>
      </Box>
    </PortalLayout>
  );
}
