import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Search,
  Visibility,
  Download,
  QrCode,
  Close,
  LocationOn,
  Person,
  CalendarToday,
  SquareFoot
} from '@mui/icons-material';
import { sampleFraData } from '../data/fraData';
import { generatePDF } from '../utils/pdfGenerator';
import { notifyPDFGenerated } from '../utils/notificationService';
import QRCode from 'qrcode';

// Constants
const STATUS_CONFIG = {
  active: { color: 'success', label: 'Active' },
  pending: { color: 'warning', label: 'Pending' },
  expired: { color: 'error', label: 'Expired' }
};

const QR_CODE_OPTIONS = {
  errorCorrectionLevel: 'M',
  type: 'image/png',
  quality: 0.92,
  width: 256,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

// Custom hook for QR code generation
const useQRCode = () => {
  const generateQRData = useCallback((patta) => {
    return JSON.stringify({
      id: patta.id,
      holderName: patta.HOLDER_NAME,
      fatherName: patta.FATHER_NAME,
      district: patta.DISTRICT,
      tehsil: patta.TEHSIL,
      gramPanchayat: patta.GRAM_PANCHAYAT,
      khasraNo: patta.KHASRA_NO,
      totalArea: patta.TOTAL_AREA_SQFT,
      boundaries: {
        east: patta.BOUNDARY_EAST || 'सरकारी जमीन',
        west: patta.BOUNDARY_WEST || 'वन भूमि',
        north: patta.BOUNDARY_NORTH || 'स्कूल',
        south: patta.BOUNDARY_SOUTH || 'आंगन'
      },
      issueDate: patta.DATE,
      verificationUrl: `https://fra-verification.gov.in/verify/${patta.id}`,
      digitalSignature: `FRA_${patta.id}_${Date.now()}`,
      certificationType: 'Individual Forest Rights Title',
      authority: 'Ministry of Environment, Forest and Climate Change',
      act: 'Forest Rights Act, 2006 - Section 3(1)(a)',
      status: 'Active',
      generatedAt: new Date().toISOString()
    });
  }, []);

  const generateQRCode = useCallback(async (qrData) => {
    return await QRCode.toDataURL(qrData, QR_CODE_OPTIONS);
  }, []);

  return { generateQRData, generateQRCode };
};

// Status badge component
const StatusBadge = React.memo(({ status = 'active' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <Chip 
      label={config.label} 
      color={config.color} 
      size="small" 
      variant="outlined"
    />
  );
});
StatusBadge.displayName = 'StatusBadge';

// Sort icon component
const SortIcon = React.memo(({ field, sortBy, sortOrder }) => {
  if (sortBy !== field) return <span className="text-gray-400">↕️</span>;
  return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
});
SortIcon.displayName = 'SortIcon';

const PattaList = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedPatta, setSelectedPatta] = useState(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loadingStates, setLoadingStates] = useState({
    downloading: false,
    downloadingId: null,
    generatingQR: false
  });

  // Custom hooks
  const { generateQRData, generateQRCode } = useQRCode();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get unique districts for filter
  const districts = useMemo(() => {
    return [...new Set(sampleFraData.map(item => item.DISTRICT))];
  }, []);

  // Show snackbar message
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = sampleFraData.filter(item => {
      const matchesSearch = 
        item.HOLDER_NAME.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.FATHER_NAME.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.KHASRA_NO.includes(debouncedSearchTerm);
      
      const matchesDistrict = selectedDistrict === '' || item.DISTRICT === selectedDistrict;
      
      return matchesSearch && matchesDistrict;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.HOLDER_NAME;
          bValue = b.HOLDER_NAME;
          break;
        case 'district':
          aValue = a.DISTRICT;
          bValue = b.DISTRICT;
          break;
        case 'area':
          aValue = parseInt(a.TOTAL_AREA_SQFT);
          bValue = parseInt(b.TOTAL_AREA_SQFT);
          break;
        case 'date':
        default:
          aValue = new Date(a.DATE.split('/').reverse().join('-'));
          bValue = new Date(b.DATE.split('/').reverse().join('-'));
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [debouncedSearchTerm, selectedDistrict, sortBy, sortOrder]);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Handle View Action
  const handleView = useCallback((patta) => {
    setSelectedPatta(patta);
    setViewDialogOpen(true);
  }, []);

  // Handle Download Action
  const handleDownload = useCallback(async (patta) => {
    try {
      // Set loading state
      setLoadingStates(prev => ({
        ...prev,
        downloading: true,
        downloadingId: patta.id
      }));

      showSnackbar('Generating PDF with your settings...', 'info');

      // Generate QR code first
      const qrData = generateQRData(patta);
      const qrCodeURL = await generateQRCode(qrData);

      // Create a temporary container for the PDF content
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-patta-container';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.minHeight = '297mm';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'serif';
      
      // Use React to render the FraPattaTemplate
      const { createRoot } = await import('react-dom/client');
      const FraPattaTemplate = (await import('../components/FraPattaTemplate.jsx')).default;
      
      document.body.appendChild(tempContainer);
      const root = createRoot(tempContainer);
      
      await new Promise((resolve) => {
        root.render(
          React.createElement(FraPattaTemplate, {
            data: patta,
            qrCodeDataURL: qrCodeURL
          })
        );
        // Wait for render to complete
        setTimeout(resolve, 1000);
      });

      // Generate PDF using the enhanced utility
      const result = await generatePDF('temp-patta-container', `FRA-Patta-${patta.id}`);
      
      // Clean up
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
      
      if (result.success) {
        // Send email notification if enabled
        try {
          const emailResult = await notifyPDFGenerated(patta);
          if (emailResult.success) {
            showSnackbar(
              `PDF generated successfully! Email notification sent. Quality: ${result.quality}, Size: ${(result.size / 1024).toFixed(1)}KB, Pages: ${result.pages}`,
              'success'
            );
          } else {
            showSnackbar(
              `PDF generated successfully! Quality: ${result.quality}, Size: ${(result.size / 1024).toFixed(1)}KB, Pages: ${result.pages}`,
              'success'
            );
          }
        } catch (emailError) {
          console.warn('Email notification failed:', emailError);
          showSnackbar(
            `PDF generated successfully! Quality: ${result.quality}, Size: ${(result.size / 1024).toFixed(1)}KB, Pages: ${result.pages}`,
            'success'
          );
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      showSnackbar(`Failed to generate PDF: ${error.message}`, 'error');
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({
        ...prev,
        downloading: false,
        downloadingId: null
      }));
    }
  }, [generateQRData, showSnackbar]);

  // Handle QR Code Action
  const handleQRCode = useCallback(async (patta) => {
    try {
      setLoadingStates(prev => ({ ...prev, generatingQR: true }));
      
      const qrData = generateQRData(patta);
      const qrCodeURL = await generateQRCode(qrData);
      
      setQrCodeDataURL(qrCodeURL);
      setSelectedPatta(patta);
      setQrDialogOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      showSnackbar('Error generating QR code. Please try again.', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, generatingQR: false }));
    }
  }, [generateQRData, generateQRCode, showSnackbar]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold"
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          All Pattas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all FRA Patta certificates
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3}>
          {/* Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, ID, or Khasra number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              helperText={
                debouncedSearchTerm !== searchTerm 
                  ? "Searching..." 
                  : `${filteredData.length} results found`
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>

          {/* District Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>District</InputLabel>
              <Select
                value={selectedDistrict}
                label="District"
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                <MenuItem value="">All Districts</MenuItem>
                {districts.map(district => (
                  <MenuItem key={district} value={district}>{district}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="district">District</MenuItem>
                <MenuItem value="area">Area</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredData.length} of {sampleFraData.length} pattas
        </Typography>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Patta ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Holder Details
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Location
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Area
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Date
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Status
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight="600">
                  Actions
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((patta) => (
              <TableRow 
                key={patta.id} 
                sx={{ 
                  '&:hover': { bgcolor: 'grey.50' },
                  '&:nth-of-type(odd)': { bgcolor: 'grey.25' }
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    {patta.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Khasra: {patta.KHASRA_NO}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    {patta.HOLDER_NAME}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    S/o {patta.FATHER_NAME}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {patta.DISTRICT}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {patta.TEHSIL}, {patta.GRAM_PANCHAYAT}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {patta.TOTAL_AREA_SQFT}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    sq. ft.
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {patta.DATE}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusBadge status="active" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleView(patta)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download PDF">
                      <IconButton 
                        size="small" 
                        color="success"
                        disabled={loadingStates.downloading && loadingStates.downloadingId === patta.id}
                        onClick={() => handleDownload(patta)}
                      >
                        {loadingStates.downloading && loadingStates.downloadingId === patta.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <Download />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Show QR Code">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        disabled={loadingStates.generatingQR}
                        onClick={() => handleQRCode(patta)}
                      >
                        {loadingStates.generatingQR ? (
                          <CircularProgress size={16} />
                        ) : (
                          <QrCode />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>📄</Typography>
            <Typography variant="h6" color="text.primary" gutterBottom>
              No pattas found
            </Typography>
            <Typography color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* View Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">
            Patta Details
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPatta && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="600">
                        Holder Information
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.HOLDER_NAME}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Father's Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.FATHER_NAME}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Patta ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatta.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="600">
                        Location Details
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      District
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.DISTRICT}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tehsil
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.TEHSIL}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Gram Panchayat
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatta.GRAM_PANCHAYAT}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SquareFoot sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="600">
                        Land Details
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Khasra Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.KHASRA_NO}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Area
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatta.TOTAL_AREA_SQFT} sq. ft.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="600">
                        Issue Details
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Issue Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPatta.DATE}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <StatusBadge status="active" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          {selectedPatta && (
            <>
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleDownload(selectedPatta)}
              >
                Download PDF
              </Button>
              <Button 
                variant="contained" 
                startIcon={<QrCode />}
                onClick={() => handleQRCode(selectedPatta)}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                Show QR Code
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">
            QR Code Verification
          </Typography>
          <IconButton onClick={() => setQrDialogOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {selectedPatta && (
            <>
              <Typography variant="h6" gutterBottom color="primary">
                {selectedPatta.HOLDER_NAME}
              </Typography>
              <Chip 
                label={`Patta ID: ${selectedPatta.id}`}
                color="secondary"
                sx={{ mb: 2 }}
              />
              
              {/* District and Area Info */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <Chip 
                  icon={<LocationOn />}
                  label={`${selectedPatta.DISTRICT}`}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  icon={<SquareFoot />}
                  label={`${selectedPatta.TOTAL_AREA_SQFT} sq.ft`}
                  variant="outlined" 
                  size="small"
                />
              </Box>
              
              {qrCodeDataURL && (
                <Box sx={{ mt: 3, mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, p: 2 }}>
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                  <Typography variant="body1" fontWeight="600" sx={{ mt: 2, color: 'primary.main' }}>
                    🔍 स्कैन करें सत्यापन के लिए
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{ color: 'primary.main' }}>
                    SCAN FOR VERIFICATION
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                    ✅ Digital Certificate with Comprehensive Data
                  </Typography>
                </Box>
              )}
              
              {/* Verification Details */}
              <Paper elevation={1} sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  🏛️ Government Authority Verification
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Ministry of Environment, Forest & Climate Change
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Forest Rights Act, 2006 - Section 3(1)(a)
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                  Status: ✅ Active & Verified
                </Typography>
              </Paper>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                🔗 Verification URL: fra-verification.gov.in/verify/{selectedPatta.id}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Contains: Holder details, boundaries, area, digital signature & timestamp
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<Download />}
            onClick={() => {
              const link = document.createElement('a');
              link.download = `FRA-QR-${selectedPatta?.id}.png`;
              link.href = qrCodeDataURL;
              link.click();
            }}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            📱 Download QR Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingStates.downloading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography sx={{ mt: 2 }}>
            Generating PDF... Please wait
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            This may take a few seconds
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
});

PattaList.displayName = 'PattaList';

export default PattaList;