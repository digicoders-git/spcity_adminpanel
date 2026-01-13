import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { sitesAPI, projectsAPI } from '../utils/api';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
  useToast,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Text,
  IconButton,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup
} from '@chakra-ui/react';
import { MapPin, Plus, Edit, Trash2, Eye, Calendar, Ruler, Home, Search, MoreVertical, Building, Grid, List } from 'lucide-react';

const SiteManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalType, setModalType] = useState('add');
  const [selectedSite, setSelectedSite] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    area: '',
    price: '',
    type: '',
    project: '',
    features: '',
    status: 'Available',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchSites();
    fetchProjects();
  }, [searchTerm]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await sitesAPI.getAll(params);
      if (response.success) {
        setSites(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sites');
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ limit: 100 });
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSite = () => {
    setModalType('add');
    setSelectedSite(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      area: '',
      price: '',
      type: '',
      project: '',
      features: '',
      status: 'Available',
      image: null,
      imagePreview: null
    });
    onOpen();
  };

  const handleEditSite = (site) => {
    setModalType('edit');
    setSelectedSite(site);
    setFormData({
      name: site.name,
      address: site.address,
      city: site.city,
      state: site.state,
      pincode: site.pincode,
      area: site.area.toString(),
      price: site.price.toString(),
      type: site.type,
      project: site.project?._id || '',
      features: site.features?.join(', ') || '',
      status: site.status,
      image: null,
      imagePreview: site.image || null
    });
    onOpen();
  };

  const handleDeleteSite = async (id) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await sitesAPI.delete(id);
        toast.success('Site deleted successfully!');
        fetchSites();
      } catch (error) {
        toast.error('Failed to delete site');
        console.error('Error deleting site:', error);
      }
    }
  };

  const handleViewSite = (site) => {
    setSelectedSite(site);
    onViewOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Sold Out': return 'blue';
      case 'On Hold': return 'yellow';
      default: return 'gray';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('📝 Form Data:', formData);
      
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('city', formData.city || '');
      formDataToSend.append('state', formData.state || '');
      formDataToSend.append('pincode', formData.pincode || '');
      formDataToSend.append('area', formData.area || '0');
      formDataToSend.append('price', formData.price || '0');
      formDataToSend.append('type', formData.type || '');
      formDataToSend.append('project', formData.project || '');
      formDataToSend.append('status', formData.status || 'Available');
      
      if (formData.features) {
        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
        featuresArray.forEach(feature => formDataToSend.append('features', feature));
      }
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      console.log('📤 Sending to API...');
      
      if (modalType === 'add') {
        const response = await sitesAPI.create(formDataToSend);
        console.log('✅ Response:', response);
        toast.success(`${formData.name} has been added to sites.`);
      } else {
        const response = await sitesAPI.update(selectedSite._id, formDataToSend);
        console.log('✅ Response:', response);
        toast.success(`${formData.name} has been updated.`);
      }

      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        area: '',
        price: '',
        type: '',
        project: '',
        features: '',
        status: 'Available',
        image: null,
        imagePreview: null
      });
      onClose();
      fetchSites();
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error(`Failed to ${modalType} site`);
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center">
            <Box>
              <Text fontSize="3xl" fontWeight="bold" color="gray.900">
                Site Management
              </Text>
              <Text color="gray.600" mt={2}>
                Manage all real estate sites and their details
              </Text>
            </Box>
            <Button
              leftIcon={<Plus size={20} />}
              colorScheme=""
              className='bg-gradient-to-r from-red-600 to-black text-white'
              onClick={handleAddSite}
              size="lg"
            >
              Add Site
            </Button>
          </HStack>
        </Box>

        {/* Search and View Toggle */}
        <HStack justify="space-between" align="center">
          <InputGroup maxW="md">
            <InputLeftElement pointerEvents="none">
              <Search size={20} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              onClick={() => setViewMode('cards')}
              className={viewMode === 'cards' ? 'bg-gradient-to-r from-red-600 to-black text-white' : ''}
              leftIcon={<Grid size={16} />}
            >
            
            </Button>
            <Button
              onClick={() => setViewMode('table')}
              className={viewMode === 'table' ? 'bg-gradient-to-r from-red-600 to-black text-white' : ''}
              leftIcon={<List size={16} />}
            >
             
            </Button>
          </ButtonGroup>
        </HStack>

        {/* Sites Cards - Show only when viewMode is 'cards' */}
        {viewMode === 'cards' && (
          <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={6}>
            {filteredSites.map((site) => (
              <Card key={site._id}>
                <CardBody>
                  <VStack spacing={4}>
                    <Box position="relative" w="full" h="48" bg="gray.200" rounded="xl" overflow="hidden">
                      {site.image ? (
                        <img 
                          src={site.image} 
                          alt={site.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" h="full">
                          <Building size={64} color="gray" />
                        </Box>
                      )}
                      <Badge
                        position="absolute"
                        top={3}
                        right={3}
                        colorScheme={getStatusColor(site.status)}
                        variant="solid"
                      >
                        {site.status}
                      </Badge>
                    </Box>

                    <VStack spacing={3} w="full" align="start">
                      <Box>
                        <Text fontSize="xl" fontWeight="bold">{site.name}</Text>
                        <HStack spacing={2} mt={1}>
                          <MapPin size={16} />
                          <Text fontSize="sm" color="gray.600">{site.city}, {site.state}</Text>
                        </HStack>
                      </Box>

                      <Box w="full">
                        <Text fontSize="sm" color="gray.500" mb={2}>Address:</Text>
                        <Text fontSize="sm">{site.address}</Text>
                      </Box>

                      <SimpleGrid columns={2} spacing={4} w="full">
                        <Box textAlign="center" p={3} bg="blue.50" rounded="lg">
                          <Text fontSize="lg" fontWeight="bold" color="blue.600">{site.area} sq ft</Text>
                          <Text fontSize="xs" color="gray.600">Area</Text>
                        </Box>
                        <Box textAlign="center" p={3} bg="green.50" rounded="lg">
                          <Text fontSize="lg" fontWeight="bold" color="green.600">₹{site.price.toLocaleString()}</Text>
                          <Text fontSize="xs" color="gray.600">Price</Text>
                        </Box>
                      </SimpleGrid>

                      <Box w="full">
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.500">Type:</Text>
                          <Text fontSize="sm" fontWeight="bold">{site.type}</Text>
                        </HStack>
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="sm" color="gray.500">Project:</Text>
                          <Text fontSize="sm" fontWeight="bold">{site.project?.name || 'N/A'}</Text>
                        </HStack>
                      </Box>

                      <HStack spacing={2} w="full" pt={2}>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                          variant="solid" 
                          flex={1} 
                          leftIcon={<Eye size={16} />}
                          onClick={() => handleViewSite(site)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                          variant="solid" 
                          flex={1} 
                          leftIcon={<Edit size={16} />}
                          onClick={() => handleEditSite(site)}
                        >
                          Edit
                        </Button>
                        <IconButton
                          size="sm"
                          className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                          variant="solid"
                          icon={<Trash2 size={16} />}
                          onClick={() => handleDeleteSite(site._id)}
                        />
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Sites Table - Show only when viewMode is 'table' */}
        {viewMode === 'table' && (
          <Box bg="white" rounded="xl" shadow="lg" border="1px" borderColor="gray.100">
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Site Details</Th>
                    <Th>Location</Th>
                    <Th>Area</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSites.map((site) => (
                    <Tr key={site._id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <HStack spacing={3}>
                          <Box w={10} h={10} bg="gray.200" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                            <Building size={20} />
                          </Box>
                          <Box>
                            <Text fontWeight="medium">{site.name}</Text>
                            <Text fontSize="sm" color="gray.500">{site.type}</Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <MapPin size={16} />
                            <Text fontSize="sm">{site.city}, {site.state}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">{site.address}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{site.area} sq ft</Text>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="red.600">₹{site.price.toLocaleString()}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(site.status)} variant="subtle">
                          {site.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<Eye size={16} />}
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                            variant="solid"
                            onClick={() => handleViewSite(site)}
                          />
                          <IconButton
                            icon={<Edit size={16} />}
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                            variant="solid"
                            onClick={() => handleEditSite(site)}
                          />
                          <IconButton
                            icon={<Trash2 size={16} />}
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-black text-white hover:from-red-700 hover:to-gray-900"
                            variant="solid"
                            onClick={() => handleDeleteSite(site._id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </VStack>

      {/* Add/Edit Site Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalType === 'add' ? 'Add New Site' : 'Edit Site'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Site Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter site name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Address</FormLabel>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </FormControl>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>State</FormLabel>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Pincode</FormLabel>
                    <Input
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Pincode"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Area (sq ft)</FormLabel>
                    <Input
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="Area in sq ft"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Price (₹)</FormLabel>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Total price"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Type</FormLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="Select type"
                    >
                      <option value="Plot">Plot</option>
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Commercial">Commercial</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Project</FormLabel>
                    <Select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      placeholder="Select project"
                    >
                      {projects.map(project => (
                        <option key={project._id} value={project._id}>{project.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Features (comma separated)</FormLabel>
                  <Input
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    placeholder="e.g., Corner Plot, Park Facing, Gated Community"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Reserved">Reserved</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Site Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    p={1}
                  />
                  {formData.imagePreview && (
                    <Box mt={2} w="full" maxW="200px">
                      <img 
                        src={formData.imagePreview} 
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </Box>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="" 
                className='bg-gradient-to-r from-red-600 to-black text-white'
                type="submit"
              >
                {modalType === 'add' ? 'Add Site' : 'Update Site'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Site Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Site Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSite && (
              <VStack spacing={6} align="stretch">
                {selectedSite.image && (
                  <Box w="full" h="300px" bg="gray.200" rounded="xl" overflow="hidden">
                    <img 
                      src={selectedSite.image} 
                      alt={selectedSite.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}

                <SimpleGrid columns={2} spacing={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Site Name</Text>
                    <Text fontSize="lg" fontWeight="bold">{selectedSite.name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Type</Text>
                    <Badge colorScheme="blue" fontSize="md" p={2}>{selectedSite.type}</Badge>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Address</Text>
                  <Text fontSize="md">{selectedSite.address}</Text>
                </Box>

                <SimpleGrid columns={3} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>City</Text>
                    <Text fontSize="md" fontWeight="medium">{selectedSite.city}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>State</Text>
                    <Text fontSize="md" fontWeight="medium">{selectedSite.state}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Pincode</Text>
                    <Text fontSize="md" fontWeight="medium">{selectedSite.pincode}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={6}>
                  <Box p={4} bg="blue.50" rounded="lg">
                    <Text fontSize="sm" color="gray.600" mb={1}>Area</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">{selectedSite.area} sq ft</Text>
                  </Box>
                  <Box p={4} bg="green.50" rounded="lg">
                    <Text fontSize="sm" color="gray.600" mb={1}>Price</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">₹{selectedSite.price.toLocaleString()}</Text>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Project</Text>
                    <Text fontSize="md" fontWeight="medium">{selectedSite.project?.name || 'N/A'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>Status</Text>
                    <Badge colorScheme={getStatusColor(selectedSite.status)} fontSize="md" p={2}>{selectedSite.status}</Badge>
                  </Box>
                </SimpleGrid>

                {selectedSite.features && selectedSite.features.length > 0 && (
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={2}>Features</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {selectedSite.features.map((feature, index) => (
                        <Badge key={index} colorScheme="purple" variant="subtle" p={2}>
                          {feature}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                )}

                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Created At</Text>
                  <Text fontSize="md">{new Date(selectedSite.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              className="bg-gradient-to-r from-red-600 to-black text-white"
              mr={3} 
              onClick={() => {
                onViewClose();
                handleEditSite(selectedSite);
              }}
              leftIcon={<Edit size={16} />}
            >
              Edit Site
            </Button>
            <Button variant="ghost" onClick={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SiteManagement;