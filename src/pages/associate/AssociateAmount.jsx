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
  useToast,
  Spinner
} from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { paymentsAPI, projectsAPI } from '../../utils/api';

const AssociateAmount = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState('add');
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    project: '',
    amount: '',
    paymentType: '',
    paymentMethod: '',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchProjects();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll({ limit: 100 });
      setPayments(response.data);
    } catch (error) {
      toast({ title: 'Error fetching payments', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ limit: 100 });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Calculate totals
  const totals = {
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    receivedAmount: payments.filter(p => p.status === 'Received').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'green';
      case 'Pending': return 'yellow';
      case 'Bounced': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'blue';
    }
  };

  const handleAddPayment = () => {
    setModalType('add');
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      project: '',
      amount: '',
      paymentType: '',
      paymentMethod: '',
      dueDate: '',
      notes: ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      await paymentsAPI.create(formData);
      toast({ title: 'Payment added successfully', status: 'success', duration: 3000 });
      fetchPayments();
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    }
  };

  const filterPaymentsByType = (type) => {
    switch (type) {
      case 'received':
        return payments.filter(p => p.status === 'Received');
      case 'pending':
        return payments.filter(p => p.status === 'Pending');
      case 'booking':
        return payments.filter(p => p.paymentType === 'Booking');
      default:
        return payments;
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
          <h1 className="text-3xl font-bold text-gray-900">Amount Management</h1>
          <p className="text-gray-600 mt-2">Track payments, advances, and EMIs</p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          colorScheme=""
          className='bg-gradient-to-r from-red-600 to-black text-white'
          onClick={handleAddPayment}
        >
          Add Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Box className="card">
          <Stat>
            <StatLabel>Total Amount</StatLabel>
            <StatNumber fontSize="2xl" color="purple.500">
              {formatCurrency(totals.totalAmount)}
            </StatNumber>
            <StatHelpText>All payments</StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Received Amount</StatLabel>
            <StatNumber fontSize="2xl" color="green.500">
              {formatCurrency(totals.receivedAmount)}
            </StatNumber>
            <StatHelpText>Completed payments</StatHelpText>
          </Stat>
        </Box>
        <Box className="card">
          <Stat>
            <StatLabel>Pending Amount</StatLabel>
            <StatNumber fontSize="2xl" color="orange.500">
              {formatCurrency(totals.pendingAmount)}
            </StatNumber>
            <StatHelpText>Outstanding balance</StatHelpText>
          </Stat>
        </Box>
      </SimpleGrid>

      <div className="card">
        <Tabs>
          <TabList>
            <Tab>All Payments ({payments.length})</Tab>
            <Tab>Received ({filterPaymentsByType('received').length})</Tab>
            <Tab>Pending ({filterPaymentsByType('pending').length})</Tab>
            <Tab>Booking ({filterPaymentsByType('booking').length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <PaymentTable 
                payments={payments} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            </TabPanel>
            <TabPanel p={0}>
              <PaymentTable 
                payments={filterPaymentsByType('received')} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            </TabPanel>
            <TabPanel p={0}>
              <PaymentTable 
                payments={filterPaymentsByType('pending')} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            </TabPanel>
            <TabPanel p={0}>
              <PaymentTable 
                payments={filterPaymentsByType('booking')} 
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
          <ModalHeader>Add Payment Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Customer Name</FormLabel>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </FormControl>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="+91 9876543210"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    placeholder="email@example.com"
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Project</FormLabel>
                <Select
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </Select>
              </FormControl>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </FormControl>
              </HStack>
              <HStack w="full">
                <FormControl isRequired>
                  <FormLabel>Payment Type</FormLabel>
                  <Select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  >
                    <option value="">Select Type</option>
                    <option value="Booking">Booking</option>
                    <option value="Installment">Installment</option>
                    <option value="Final">Final</option>
                    <option value="Token">Token</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online</option>
                    <option value="Card">Card</option>
                  </Select>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </FormControl>
              <HStack spacing={4} w="full" justify="end">
                <Button onClick={onClose}>Cancel</Button>
                <Button colorScheme="" className='bg-gradient-to-r from-red-600 to-black text-white' onClick={handleSubmit}>
                  Add Payment
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

const PaymentTable = ({ payments, formatCurrency, getStatusColor }) => (
  <Box overflowX="auto">
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Customer</Th>
          <Th>Project</Th>
          <Th>Amount</Th>
          <Th>Payment Type</Th>
          <Th>Payment Method</Th>
          <Th>Due Date</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {payments.map((payment) => (
          <Tr key={payment._id}>
            <Td>
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium">{payment.customerName}</Text>
                <Text fontSize="sm" color="gray.500">{payment.customerPhone}</Text>
              </VStack>
            </Td>
            <Td>{payment.project?.name}</Td>
            <Td>
              <Text fontWeight="medium" color="green.600">{formatCurrency(payment.amount)}</Text>
            </Td>
            <Td>
              <Badge colorScheme="purple">{payment.paymentType}</Badge>
            </Td>
            <Td>{payment.paymentMethod}</Td>
            <Td>
              <Text fontSize="sm">{new Date(payment.dueDate).toLocaleDateString()}</Text>
            </Td>
            <Td>
              <Badge colorScheme={getStatusColor(payment.status)}>
                {payment.status}
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

export default AssociateAmount;