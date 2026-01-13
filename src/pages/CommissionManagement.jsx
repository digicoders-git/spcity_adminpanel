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
  Textarea,
  Select,
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
  useToast,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input
} from '@chakra-ui/react';
import { CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp } from 'lucide-react';
import { commissionsAPI } from '../utils/api';

const CommissionManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const [withdrawals, setWithdrawals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [processData, setProcessData] = useState({ status: '', notes: '' });
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 10 });
  const toast = useToast();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [withdrawalsRes, statsRes] = await Promise.all([
        commissionsAPI.getAllWithdrawals(filters),
        commissionsAPI.getDashboardStats()
      ]);
      
      setWithdrawals(withdrawalsRes.data?.withdrawals || []);
      setDashboardStats(statsRes.data || {});
    } catch (error) {
      console.error('API Error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch data', 
        status: 'error', 
        duration: 3000 
      });
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
      'Pending': 'yellow',
      'Completed': 'green',
      'Failed': 'red',
      'Cancelled': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Clock className="w-4 h-4" />,
      'Completed': <CheckCircle className="w-4 h-4" />,
      'Failed': <XCircle className="w-4 h-4" />,
      'Cancelled': <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const handleProcessWithdrawal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setProcessData({ status: '', notes: '' });
    onOpen();
  };

  const handleConfirmProcess = () => {
    onClose();
    onAlertOpen();
  };

  const processWithdrawal = async () => {
    try {
      await commissionsAPI.processWithdrawal(selectedWithdrawal._id, processData);
      toast({ 
        title: 'Success', 
        description: `Withdrawal ${processData.status.toLowerCase()} successfully`, 
        status: 'success', 
        duration: 3000 
      });
      fetchData();
      onAlertClose();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        status: 'error', 
        duration: 3000 
      });
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
          <p className="text-gray-600 mt-2">Manage associate commissions and withdrawal requests</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Box className="card">
          <Stat>
            <StatLabel>Total Commissions</StatLabel>
            <StatNumber fontSize="2xl" color="blue.500">
              {dashboardStats.totalCommissions || 0}
            </StatNumber>
            <StatHelpText>
              <Users className="w-4 h-4 inline mr-1" />
              Commission records
            </StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Total Commission Amount</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              {formatCurrency(dashboardStats.totalCommissionAmount || 0)}
            </StatNumber>
            <StatHelpText>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              All time commissions
            </StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Pending Withdrawals</StatLabel>
            <StatNumber fontSize="2xl" color="orange.500">
              {dashboardStats.pendingWithdrawals || 0}
            </StatNumber>
            <StatHelpText>
              <Clock className="w-4 h-4 inline mr-1" />
              {formatCurrency(dashboardStats.pendingWithdrawalAmount || 0)}
            </StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Completed Withdrawals</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              {dashboardStats.completedWithdrawals || 0}
            </StatNumber>
            <StatHelpText>
              <DollarSign className="w-4 h-4 inline mr-1" />
              {formatCurrency(dashboardStats.completedWithdrawalAmount || 0)}
            </StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      {/* Filters */}
      <Box className="card">
        <HStack spacing={4}>
          <FormControl maxW="200px">
            <FormLabel>Filter by Status</FormLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </FormControl>
        </HStack>
      </Box>

      {/* Withdrawal Requests Table */}
      <div className="card">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
          <p className="text-gray-600">Manage associate withdrawal requests</p>
        </div>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Associate</Th>
                <Th>Amount</Th>
                <Th>Method</Th>
                <Th>Account Details</Th>
                <Th>Date Requested</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {withdrawals.map((withdrawal) => (
                <Tr key={withdrawal._id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{withdrawal.associate?.name}</Text>
                      <Text fontSize="sm" color="gray.500">{withdrawal.associate?.email}</Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontWeight="medium" color="green.600">
                      {formatCurrency(withdrawal.amount)}
                    </Text>
                  </Td>
                  <Td>{withdrawal.method}</Td>
                  <Td>
                    <Text fontSize="sm" maxW="200px" isTruncated>
                      {withdrawal.accountDetails}
                    </Text>
                  </Td>
                  <Td>{new Date(withdrawal.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Badge 
                      colorScheme={getStatusColor(withdrawal.status)}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      w="fit-content"
                    >
                      {getStatusIcon(withdrawal.status)}
                      {withdrawal.status}
                    </Badge>
                  </Td>
                  <Td>
                    {withdrawal.status === 'Pending' && (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => handleProcessWithdrawal(withdrawal)}
                      >
                        Process
                      </button>
                    )}
                    {withdrawal.status !== 'Pending' && (
                      <Text fontSize="sm" color="gray.500">
                        Processed by {withdrawal.processedBy?.name}
                      </Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {withdrawals.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">No withdrawal requests found</Text>
          </Box>
        )}
      </div>

      {/* Process Withdrawal Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Process Withdrawal Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedWithdrawal && (
              <VStack spacing={4} align="start">
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text><strong>Associate:</strong> {selectedWithdrawal.associate?.name}</Text>
                  <Text><strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount)}</Text>
                  <Text><strong>Method:</strong> {selectedWithdrawal.method}</Text>
                  <Text><strong>Account Details:</strong> {selectedWithdrawal.accountDetails}</Text>
                  <Text><strong>Reference:</strong> {selectedWithdrawal.reference}</Text>
                </Box>
                
                <FormControl isRequired>
                  <FormLabel>Action</FormLabel>
                  <Select
                    value={processData.status}
                    onChange={(e) => setProcessData({...processData, status: e.target.value})}
                    placeholder="Select action"
                  >
                    <option value="Completed">Approve & Complete</option>
                    <option value="Failed">Mark as Failed</option>
                    <option value="Cancelled">Cancel Request</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    value={processData.notes}
                    onChange={(e) => setProcessData({...processData, notes: e.target.value})}
                    placeholder="Add processing notes (optional)"
                  />
                </FormControl>
                
                <HStack spacing={4} w="full" justify="end">
                  <Button onClick={onClose}>Cancel</Button>
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    onClick={handleConfirmProcess}
                    disabled={!processData.status}
                  >
                    Process Request
                  </button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Action
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to {processData.status?.toLowerCase()} this withdrawal request for{' '}
              <strong>{formatCurrency(selectedWithdrawal?.amount || 0)}</strong>?
              {processData.status === 'Completed' && (
                <Text mt={2} color="orange.600" fontSize="sm">
                  ⚠️ This action will mark the withdrawal as completed. Make sure the payment has been processed.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button 
                colorScheme={processData.status === 'Completed' ? 'green' : 'red'} 
                onClick={processWithdrawal} 
                ml={3}
              >
                Confirm {processData.status}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
};

export default CommissionManagement;