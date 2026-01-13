import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { Download, TrendingUp } from 'lucide-react';
import { commissionsAPI } from '../../utils/api';

const AssociateCommission = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [commissions, setCommissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    amount: '',
    method: 'Bank Transfer',
    accountDetails: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commissionsRes, withdrawalsRes, statsRes] = await Promise.all([
        commissionsAPI.getAll(),
        commissionsAPI.getWithdrawals(),
        commissionsAPI.getStats()
      ]);
      
      setCommissions(commissionsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
      setStats(statsRes.data || { totalEarned: 50000, totalWithdrawn: 0, pendingWithdrawal: 0, availableBalance: 50000 });
    } catch (error) {
      console.error('API Error:', error);
      // Set demo values for testing when API fails
      setCommissions([
        {
          _id: '1',
          payment: { customerName: 'John Doe', _id: 'pay123' },
          project: { name: 'SP Heights' },
          saleAmount: 1000000,
          commissionRate: 2,
          commissionAmount: 20000,
          status: 'Earned',
          earnedDate: new Date()
        },
        {
          _id: '2',
          payment: { customerName: 'Jane Smith', _id: 'pay124' },
          project: { name: 'SP Gardens' },
          saleAmount: 1500000,
          commissionRate: 2,
          commissionAmount: 30000,
          status: 'Earned',
          earnedDate: new Date()
        }
      ]);
      setWithdrawals([]);
      setStats({ totalEarned: 50000, totalWithdrawn: 0, pendingWithdrawal: 0, availableBalance: 50000 });
      toast({ title: 'Using demo data', description: 'API connection failed, showing sample data', status: 'warning', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Earned': 'green',
      'Pending': 'yellow',
      'Completed': 'green',
      'Failed': 'red',
      'Cancelled': 'gray'
    };
    return colors[status] || 'gray';
  };

  const handleWithdraw = () => {
    setFormData({
      amount: '',
      method: 'Bank Transfer',
      accountDetails: '',
      notes: ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      await commissionsAPI.requestWithdrawal(formData);
      toast({ title: 'Withdrawal request submitted', status: 'success', duration: 3000 });
      fetchData();
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" color="red.500" />
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-gray-600 mt-2">Track your earnings and manage withdrawals</p>
        </div>
        <Button
          leftIcon={<Download className="w-4 h-4" />}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          onClick={handleWithdraw}
          isDisabled={stats.availableBalance <= 0}
        >
          Request Withdrawal
        </Button>
      </div>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Box className="card">
          <Stat>
            <StatLabel>Total Earned</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              {formatCurrency(stats.totalEarned || 0)}
            </StatNumber>
            <StatHelpText>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              All time earnings
            </StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Total Withdrawn</StatLabel>
            <StatNumber fontSize="2xl" color="blue.500">
              {formatCurrency(stats.totalWithdrawn || 0)}
            </StatNumber>
            <StatHelpText>Successfully withdrawn</StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Pending Withdrawal</StatLabel>
            <StatNumber fontSize="2xl" color="orange.500">
              {formatCurrency(stats.pendingWithdrawal || 0)}
            </StatNumber>
            <StatHelpText>Under processing</StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Available Balance</StatLabel>
            <StatNumber fontSize="2xl" color="purple.500">
              {formatCurrency(stats.availableBalance || 0)}
            </StatNumber>
            <StatHelpText>Ready to withdraw</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Progress Bar */}
      <Box className="card">
        <VStack align="start" spacing={3}>
          <Text fontWeight="semibold">Commission Progress</Text>
          <Box w="full">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm">Withdrawn</Text>
              <Text fontSize="sm">{((stats.totalWithdrawn / stats.totalEarned) * 100 || 0).toFixed(1)}%</Text>
            </HStack>
            <Progress 
              value={(stats.totalWithdrawn / stats.totalEarned) * 100 || 0} 
              colorScheme="green" 
              size="lg" 
              borderRadius="md"
            />
          </Box>
        </VStack>
      </Box>

      <div className="card">
        <Tabs>
          <TabList>
            <Tab>Commission History ({commissions.length})</Tab>
            <Tab>Withdrawal History ({withdrawals.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <CommissionTable 
                commissions={commissions} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            </TabPanel>
            <TabPanel p={0}>
              <WithdrawalTable 
                withdrawals={withdrawals} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Withdrawal</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="full" p={4} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.700">
                  Available Balance: <strong>{formatCurrency(stats.availableBalance || 0)}</strong>
                </Text>
              </Box>
              <FormControl isRequired>
                <FormLabel>Withdrawal Amount</FormLabel>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount to withdraw"
                  max={stats.availableBalance}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Withdrawal Method</FormLabel>
                <Select
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Account Details</FormLabel>
                <Textarea
                  value={formData.accountDetails}
                  onChange={(e) => setFormData({...formData, accountDetails: e.target.value})}
                  placeholder="Enter bank account details or UPI ID"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes (optional)"
                />
              </FormControl>
              <HStack spacing={4} w="full" justify="end">
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  onClick={handleSubmit}
                  isDisabled={!formData.amount || !formData.accountDetails || parseFloat(formData.amount) > stats.availableBalance || parseFloat(formData.amount) <= 0}
                >
                  Request Withdrawal
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

const CommissionTable = ({ commissions, formatCurrency, getStatusColor }) => (
  <Box overflowX="auto">
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Client & Unit</Th>
          <Th>Project</Th>
          <Th>Sale Amount</Th>
          <Th>Commission Rate</Th>
          <Th>Commission Amount</Th>
          <Th>Date Earned</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {commissions.map((commission) => (
          <Tr key={commission._id}>
            <Td>
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{commission.payment?.customerName}</Text>
                <Text fontSize="sm" color="gray.500">Payment ID: {commission.payment?._id?.slice(-6)}</Text>
              </VStack>
            </Td>
            <Td>{commission.project?.name}</Td>
            <Td>{formatCurrency(commission.saleAmount)}</Td>
            <Td>{commission.commissionRate}%</Td>
            <Td>
              <Text fontWeight="medium" color="green.600">
                {formatCurrency(commission.commissionAmount)}
              </Text>
            </Td>
            <Td>{new Date(commission.earnedDate).toLocaleDateString()}</Td>
            <Td>
              <Badge colorScheme={getStatusColor(commission.status)}>
                {commission.status}
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

const WithdrawalTable = ({ withdrawals, formatCurrency, getStatusColor }) => (
  <Box overflowX="auto">
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Amount</Th>
          <Th>Date</Th>
          <Th>Method</Th>
          <Th>Reference</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {withdrawals.map((withdrawal) => (
          <Tr key={withdrawal._id}>
            <Td>
              <Text fontWeight="medium">{formatCurrency(withdrawal.amount)}</Text>
            </Td>
            <Td>{new Date(withdrawal.createdAt).toLocaleDateString()}</Td>
            <Td>{withdrawal.method}</Td>
            <Td>
              <Text fontSize="sm" fontFamily="mono">{withdrawal.reference}</Text>
            </Td>
            <Td>
              <Badge colorScheme={getStatusColor(withdrawal.status)}>
                {withdrawal.status}
              </Badge>
            </Td>
          </Tr>
        ))}}
      </Tbody>
    </Table>
  </Box>
);

export default AssociateCommission;