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
import { CheckCircle, XCircle, Clock, DollarSign, Users, TrendingUp, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { commissionsAPI, expensesAPI } from '../utils/api';

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
  const [advanceSummary, setAdvanceSummary] = useState({ totalAdvance: 0 });
  const [fetchingAdvance, setFetchingAdvance] = useState(false);

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

  const handleProcessWithdrawal = async (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setProcessData({ status: '', notes: '' });
    onOpen();
    
    // Fetch advance summary
    try {
      setFetchingAdvance(true);
      const res = await expensesAPI.getAdvanceSummary(withdrawal.associate?._id || withdrawal.associate);
      if (res.success) {
        setAdvanceSummary(res);
      }
    } catch (error) {
      console.error('Failed to fetch advance summary');
    } finally {
      setFetchingAdvance(false);
    }
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

  const handleDeleteWithdrawal = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this withdrawal record? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await commissionsAPI.deleteWithdrawal(id);
        Swal.fire(
          'Deleted!',
          'Withdrawal record has been deleted.',
          'success'
        );
        fetchData();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete record',
          status: 'error',
          duration: 3000
        });
      }
    }
  };

  const handleDeleteCommission = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this commission record? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await commissionsAPI.deleteCommission(id);
        Swal.fire(
          'Deleted!',
          'Commission record has been deleted.',
          'success'
        );
        // We'll need a way to refresh commissions table
        // Since it's a separate component, we'll pass a refresh prop or just refresh everything
        fetchData();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete record',
          status: 'error',
          duration: 3000
        });
      }
    }
  };

  const handleClearAllWithdrawals = async () => {
    const result = await Swal.fire({
      title: 'Danger Zone!',
      text: "Are you sure you want to PERMANENTLY delete ALL withdrawal records? This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, CLEAR EVERYTHING!'
    });

    if (result.isConfirmed) {
      try {
        await commissionsAPI.clearAllWithdrawals();
        Swal.fire('Cleared!', 'All withdrawal records have been removed.', 'success');
        fetchData();
      } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
      }
    }
  };

  const handleClearAllCommissions = async () => {
    const result = await Swal.fire({
      title: 'Danger Zone!',
      text: "Are you sure you want to PERMANENTLY delete ALL commission history records? This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, CLEAR EVERYTHING!'
    });

    if (result.isConfirmed) {
      try {
        await commissionsAPI.clearAllCommissions();
        Swal.fire('Cleared!', 'All commission records have been removed.', 'success');
        fetchData();
      } catch (error) {
        toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
      }
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

      {/* Commission & Withdrawal Tabs */}
      <div className="card">
        <Tabs colorScheme="red">
          <TabList>
            <Tab fontWeight="bold">Withdrawal Requests ({withdrawals.length})</Tab>
            <Tab fontWeight="bold">System Commission History</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={4}>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Withdrawal Requests</h2>
                  <p className="text-gray-500 text-sm">Manage associate withdrawal requests</p>
                </div>
                {withdrawals.length > 0 && (
                  <button
                    onClick={handleClearAllWithdrawals}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-bold text-sm border border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Requests</span>
                  </button>
                )}
              </div>
              
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Associate</Th>
                      <Th>Amount</Th>
                      <Th>Tax Deductions</Th>
                      <Th>Net Payable</Th>
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
                            <Text fontWeight="medium" color="gray.800">{withdrawal.associate?.name}</Text>
                            <Text fontSize="xs" color="gray.500">{withdrawal.associate?.email}</Text>
                            <Text fontSize="xs" fontFamily="mono" color="blue.500">{withdrawal.associate?.phone}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="black" color="blue.600">
                            {formatCurrency(withdrawal.amount)}
                          </Text>
                        </Td>
                        <Td>
                          {withdrawal.status === 'Completed' ? (
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="bold" color="red.500">TDS (5%): {formatCurrency(withdrawal.tdsAmount || 0)}</Text>
                              <Text fontSize="xs" fontWeight="bold" color="red.500">Service Tax (5%): {formatCurrency(withdrawal.serviceTaxAmount || 0)}</Text>
                            </VStack>
                          ) : (
                            <Text fontSize="xs" color="gray.400">Calculated on approval</Text>
                          )}
                        </Td>
                        <Td>
                          <Text fontWeight="black" color="green.600">
                            {withdrawal.status === 'Completed' ? formatCurrency(withdrawal.netAmount || 0) : '---'}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle" px={2} borderRadius="full">
                            {withdrawal.method}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="xs" maxW="200px" color="gray.600">
                            {withdrawal.accountDetails}
                          </Text>
                        </Td>
                        <Td fontSize="sm" color="gray.600">{new Date(withdrawal.createdAt).toLocaleDateString()}</Td>
                        <Td>
                          <Badge 
                            colorScheme={getStatusColor(withdrawal.status)}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            w="fit-content"
                            variant="solid"
                            px={2}
                            borderRadius="full"
                            fontSize="10px"
                          >
                            {getStatusIcon(withdrawal.status)}
                            {withdrawal.status}
                          </Badge>
                        </Td>
                        <Td>
                          {withdrawal.status === 'Pending' && (
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
                              onClick={() => handleProcessWithdrawal(withdrawal)}
                            >
                              Process
                            </button>
                          )}
                          {withdrawal.status !== 'Pending' && (
                            <VStack align="start" spacing={0}>
                               <Text fontSize="xs" fontWeight="bold" color="gray.700">Processed By:</Text>
                               <Text fontSize="xs" color="blue.600">{withdrawal.processedBy?.name || 'Admin'}</Text>
                            </VStack>
                          )}
                        </Td>
                        <Td>
                          <button
                            onClick={() => handleDeleteWithdrawal(withdrawal._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {withdrawals.length === 0 && (
                <Box textAlign="center" py={12} bg="gray.50" borderRadius="xl" mt={4}>
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <Text color="gray.500" fontWeight="medium">No pending withdrawal requests found</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel p={0} pt={4}>
               <AllCommissionsTable formatCurrency={formatCurrency} onDelete={handleDeleteCommission} onClearAll={handleClearAllCommissions} />
            </TabPanel>
          </TabPanels>
        </Tabs>
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
                <Box w="full" p={4} bg="gray.100" borderRadius="xl" border="1px" borderColor="gray-200 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase">Associate</Text>
                      <Text fontWeight="bold">{selectedWithdrawal.associate?.name}</Text>
                    </div>
                    <div>
                      <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase">Requested Amnt</Text>
                      <Text fontWeight="black" color="blue.600">{formatCurrency(selectedWithdrawal.amount)}</Text>
                    </div>
                    
                    {/* 🔥 Tax Preview */}
                    <div className="col-span-2 bg-white/50 p-2 rounded border border-dashed border-gray-300">
                       <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.600">TDS (5%)</Text>
                          <Text fontSize="xs" fontWeight="bold" color="red.500">-{formatCurrency(selectedWithdrawal.amount * 0.05)}</Text>
                       </HStack>
                       <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.600">Service Tax (5%)</Text>
                          <Text fontSize="xs" fontWeight="bold" color="red.500">-{formatCurrency(selectedWithdrawal.amount * 0.05)}</Text>
                       </HStack>
                    </div>

                    <div className="col-span-2 border-t border-gray-200 mt-2 pt-2">
                       <HStack justify="space-between" align="center">
                          <div>
                            <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase">Advance Deductible</Text>
                            {fetchingAdvance ? <Spinner size="xs" /> : (
                              <Text fontWeight="bold" color="red.600">{formatCurrency(advanceSummary.totalAdvance || 0)}</Text>
                            )}
                          </div>
                          <div className="text-right">
                             <Text fontSize="xs" fontWeight="black" color="gray.400" textTransform="uppercase">Final Net Payable</Text>
                             <Text fontWeight="black" fontSize="xl" color="green.600">{formatCurrency(Math.max(0, selectedWithdrawal.amount - (selectedWithdrawal.amount * 0.1) - (advanceSummary.totalAdvance || 0)))}</Text>
                          </div>
                       </HStack>
                    </div>
                  </div>
                  <Text mt={3} fontSize="xs" color="gray.500 italic">Method: {selectedWithdrawal.method} | Ref: {selectedWithdrawal.reference}</Text>
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

const AllCommissionsTable = ({ formatCurrency, onDelete, onClearAll }) => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await commissionsAPI.getAll();
      setCommissions(res.data || []);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to fetch commissions', 
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box py={10} textAlign="center">
        <Spinner size="lg" color="red.500" thickness="4px" />
        <Text mt={2} color="gray.500">Loading commission data...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <div className="mb-4 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-semibold text-gray-800">Commission History</h2>
           <p className="text-gray-500 text-sm">Full log of system generated commissions</p>
        </div>
        {commissions.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-bold text-sm border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All History</span>
          </button>
        )}
      </div>
      <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Associate</Th>
            <Th>Client</Th>
            <Th>Project</Th>
            <Th>Sale Amount</Th>
            <Th>Rate</Th>
            <Th>Commission</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {commissions.map((comm) => (
            <Tr key={comm._id}>
              <Td>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="gray.800">{comm.associate?.name || 'Self/Admin'}</Text>
                  <Badge variant="subtle" colorScheme="purple" fontSize="xs" borderRadius="full" px={2}>
                    {comm.associateRank || 'ADMIN'}
                  </Badge>
                </VStack>
              </Td>
              <Td fontSize="sm" color="gray.600">{comm.payment?.customerName}</Td>
              <Td fontSize="sm" color="gray.600">{comm.project?.name}</Td>
              <Td fontSize="sm" fontWeight="medium">{formatCurrency(comm.saleAmount)}</Td>
              <Td fontSize="sm">
                <Badge variant="outline" colorScheme="blue" borderRadius="md">{comm.commissionRate}%</Badge>
              </Td>
              <Td>
                <Text fontWeight="black" color="green.600">{formatCurrency(comm.commissionAmount)}</Text>
              </Td>
              <Td fontSize="xs" color="gray.500">{new Date(comm.earnedDate).toLocaleDateString()}</Td>
              <Td>
                <Badge 
                  colorScheme={comm.status === 'Earned' ? 'green' : 'orange'} 
                  variant="solid" 
                  borderRadius="full" 
                  px={2} 
                  fontSize="10px"
                  textTransform="uppercase"
                >
                    {comm.status}
                </Badge>
              </Td>
              <Td>
                <button
                  onClick={() => onDelete(comm._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {commissions.length === 0 && (
        <Box textAlign="center" py={12} bg="gray.50" borderRadius="xl" mt={4}>
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <Text color="gray.500" fontWeight="medium">No commission records found in the system</Text>
        </Box>
      )}
    </Box>
  </Box>
);
};

export default CommissionManagement;