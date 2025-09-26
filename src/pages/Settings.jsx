import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Snackbar,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Language,
  PictureAsPdf,
  Security,
  Backup,
  Notifications,
  Save,
  Download,
  Upload,
  Email,
  Send
} from '@mui/icons-material';

// Settings Context for global state management
const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on initialization
    const savedSettings = localStorage.getItem('fraPattaSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      autoSave: true,
      emailNotifications: {
        enabled: false,
        email: '',
        types: ['pdfGenerated', 'statusUpdates', 'systemAlerts']
      },
      smsNotifications: false,
      defaultLanguage: 'hindi',
      pdfQuality: 'high',
      qrCodeSize: 'medium',
      backupFrequency: 'daily',
      theme: 'dark',
      pdfPageSize: 'a4',
      watermark: true,
      compressionLevel: 85
    };
  });

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Save to localStorage immediately
      localStorage.setItem('fraPattaSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Email notification service
const EmailService = {
  // In a real application, you would use a backend service like:
  // - EmailJS for client-side email sending
  // - Firebase Functions with SendGrid
  // - AWS SES with Lambda
  // - Or your own backend API
  
  async sendNotification(email, subject, message, type = 'info') {
    try {
      // For demonstration, we'll simulate email sending
      // Replace this with actual email service integration
      
      console.log('📧 Sending Email Notification:', {
        to: email,
        subject,
        message,
        type,
        timestamp: new Date().toISOString()
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, we'll use EmailJS (free service)
      // You would need to install emailjs-com: npm install emailjs-com
      
      // Example with EmailJS (uncomment when implemented):
      /*
      const emailjs = await import('emailjs-com');
      
      const templateParams = {
        to_email: email,
        subject: subject,
        message: message,
        from_name: 'FRA Patta Generator',
        reply_to: 'noreply@fra-patta.gov.in'
      };

      await emailjs.send(
        'YOUR_SERVICE_ID',  // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY'   // Replace with your EmailJS public key
      );
      */

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, message: 'Failed to send email' };
    }
  },

  // Send PDF generation notification
  async sendPDFGeneratedNotification(email, pattaId, holderName) {
    return await this.sendNotification(
      email,
      '📄 FRA Patta PDF Generated Successfully',
      `Dear User,

Your FRA Patta certificate has been generated successfully:

• Patta ID: ${pattaId}
• Holder Name: ${holderName}
• Generated: ${new Date().toLocaleString()}

The PDF has been downloaded to your device and is ready for use.

This is an automated notification from FRA Patta Generator.
Do not reply to this email.

Best regards,
FRA Patta Generator Team`,
      'success'
    );
  },

  // Send system alert notification
  async sendSystemAlert(email, alertType, message) {
    return await this.sendNotification(
      email,
      `🚨 FRA Patta System Alert: ${alertType}`,
      `Dear User,

System Alert: ${alertType}

${message}

Timestamp: ${new Date().toLocaleString()}

Please check your FRA Patta Generator dashboard for more details.

Best regards,
FRA Patta Generator Team`,
      'warning'
    );
  }
};

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isExporting, setIsExporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: settings.emailNotifications?.email || '',
    types: settings.emailNotifications?.types || ['pdfGenerated', 'statusUpdates']
  });
  const [testingEmail, setTestingEmail] = useState(false);
  const [storageStats, setStorageStats] = useState({
    used: 2.3,
    total: 100,
    pattas: 125
  });

  // Real-time setting change handler
  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
    setSnackbar({
      open: true,
      message: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated successfully!`,
      severity: 'success'
    });
  };

  // Handle email notification settings
  const handleEmailSettingChange = (enabled) => {
    if (enabled && (!settings.emailNotifications?.email || settings.emailNotifications?.email === '')) {
      // Open dialog to configure email first
      setEmailDialogOpen(true);
      return;
    }
    
    updateSettings({
      emailNotifications: {
        ...settings.emailNotifications,
        enabled: enabled
      }
    });
    
    setSnackbar({
      open: true,
      message: enabled ? 'Email notifications enabled!' : 'Email notifications disabled!',
      severity: 'success'
    });
  };

  // Save email configuration
  const handleSaveEmailConfig = () => {
    if (!emailForm.email || !emailForm.email.includes('@')) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error'
      });
      console.log(message);
      return;
    }

    updateSettings({
      emailNotifications: {
        enabled: true,
        email: emailForm.email,
        types: emailForm.types
      }
    });

    setEmailDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Email notifications configured successfully!',
      severity: 'success'
    });
  };

  // Test email functionality
  const handleTestEmail = async () => {
    if (!settings.emailNotifications?.email) {
      setSnackbar({
        open: true,
        message: 'Please configure email address first',
        severity: 'warning'
      });
      return;
    }

    setTestingEmail(true);
    try {
      const result = await EmailService.sendNotification(
        settings.emailNotifications.email,
        '🧪 Test Email from FRA Patta Generator',
        `Hello!

This is a test email to verify your email notification settings.

If you received this email, your email notifications are working correctly!

Configuration:
• Email: ${settings.emailNotifications.email}
• Enabled Types: ${settings.emailNotifications.types?.join(', ')}
• Test Time: ${new Date().toLocaleString()}

Best regards,
FRA Patta Generator Team`,
        'info'
      );

      setSnackbar({
        open: true,
        message: result.success ? 'Test email sent! Check your inbox.' : 'Failed to send test email.',
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send test email. Please try again.',
        severity: 'error'
      });
    }
    setTestingEmail(false);
  };

  // Export settings functionality
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const dataToExport = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        pattas: JSON.parse(localStorage.getItem('fraPattaData') || '[]')
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fra-patta-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: 'Data exported successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Export failed. Please try again.',
        severity: 'error'
      });
    }
    setIsExporting(false);
  };

  // Import settings functionality
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.settings) {
          updateSettings(importedData.settings);
        }
        if (importedData.pattas) {
          localStorage.setItem('fraPattaData', JSON.stringify(importedData.pattas));
        }
        setSnackbar({
          open: true,
          message: 'Data imported successfully!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Invalid file format. Please select a valid backup file.',
          severity: 'error'
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  // Calculate storage usage
  useEffect(() => {
    const calculateStorage = () => {
      const settingsSize = JSON.stringify(settings).length;
      const pattaData = localStorage.getItem('fraPattaData') || '[]';
      const pattaSize = pattaData.length;
      const totalSize = (settingsSize + pattaSize) / 1024; // KB
      
      setStorageStats({
        used: Math.round(totalSize * 100) / 100,
        total: 100,
        pattas: JSON.parse(pattaData).length || 0
      });
    };
    
    calculateStorage();
  }, [settings]);

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          <SettingsIcon sx={{ mr: 2, verticalAlign: 'middle', color: '#667eea' }} />
          Settings & Preferences
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Customize your FRA Patta Generator experience
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Language sx={{ mr: 1 }} />
                General Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Auto-save drafts" 
                    secondary="Automatically save your work while editing"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Default Language</InputLabel>
                      <Select
                        value={settings.defaultLanguage}
                        label="Default Language"
                        onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                      >
                        <MenuItem value="hindi">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="हिंदी" size="small" color="primary" />
                            Hindi
                          </Box>
                        </MenuItem>
                        <MenuItem value="english">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="EN" size="small" color="secondary" />
                            English
                          </Box>
                        </MenuItem>
                        <MenuItem value="both">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="हिं/EN" size="small" color="success" />
                            Bilingual
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Enable Watermark" 
                    secondary="Add government watermark to PDFs"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.watermark}
                      onChange={(e) => handleSettingChange('watermark', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* PDF Generation Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <PictureAsPdf sx={{ mr: 1 }} />
                PDF Generation
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>PDF Quality</InputLabel>
                  <Select
                    value={settings.pdfQuality}
                    label="PDF Quality"
                    onChange={(e) => handleSettingChange('pdfQuality', e.target.value)}
                  >
                    <MenuItem value="low">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Fast" size="small" color="warning" />
                        Low Quality
                      </Box>
                    </MenuItem>
                    <MenuItem value="medium">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Balanced" size="small" color="info" />
                        Medium Quality
                      </Box>
                    </MenuItem>
                    <MenuItem value="high">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Best" size="small" color="success" />
                        High Quality (Recommended)
                      </Box>
                    </MenuItem>
                    <MenuItem value="ultra">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Ultra" size="small" color="error" />
                        Ultra High Quality
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>QR Code Size</InputLabel>
                  <Select
                    value={settings.qrCodeSize}
                    label="QR Code Size"
                    onChange={(e) => handleSettingChange('qrCodeSize', e.target.value)}
                  >
                    <MenuItem value="small">Small (128px)</MenuItem>
                    <MenuItem value="medium">Medium (256px)</MenuItem>
                    <MenuItem value="large">Large (512px)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Page Size</InputLabel>
                  <Select
                    value={settings.pdfPageSize}
                    label="Page Size"
                    onChange={(e) => handleSettingChange('pdfPageSize', e.target.value)}
                  >
                    <MenuItem value="a4">A4 (210 × 297 mm)</MenuItem>
                    <MenuItem value="a3">A3 (297 × 420 mm)</MenuItem>
                    <MenuItem value="letter">Letter (216 × 279 mm)</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    Compression Level: {settings.compressionLevel}%
                  </Typography>
                  <Slider
                    value={settings.compressionLevel}
                    onChange={(e, newValue) => handleSettingChange('compressionLevel', newValue)}
                    valueLabelDisplay="auto"
                    step={3}
                    marks
                    min={60}
                    max={100}
                    color="primary"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Notifications sx={{ mr: 1 }} />
                Notifications
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                        Email Notifications
                        {settings.emailNotifications?.enabled && (
                          <Chip label="Active" size="small" color="success" />
                        )}
                      </Box>
                    }
                    secondary={
                      settings.emailNotifications?.email 
                        ? `Updates will be sent to: ${settings.emailNotifications.email}`
                        : "Configure email address to receive notifications"
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        onClick={() => setEmailDialogOpen(true)}
                        variant="outlined"
                      >
                        Setup
                      </Button>
                      <Switch
                        checked={settings.emailNotifications?.enabled || false}
                        onChange={(e) => handleEmailSettingChange(e.target.checked)}
                        color="primary"
                      />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {settings.emailNotifications?.enabled && settings.emailNotifications?.email && (
                  <ListItem>
                    <ListItemText 
                      primary="Test Email Configuration"
                      secondary="Send a test email to verify your settings"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Send />}
                        onClick={handleTestEmail}
                        disabled={testingEmail}
                      >
                        {testingEmail ? 'Sending...' : 'Test Email'}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                )}
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="SMS Notifications" 
                    secondary="Get updates about patta status via SMS (Coming Soon)"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      color="primary"
                      disabled
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data & Security */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Security sx={{ mr: 1 }} />
                Data & Security
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Backup Frequency</InputLabel>
                <Select
                  value={settings.backupFrequency}
                  label="Backup Frequency"
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                >
                  <MenuItem value="hourly">Every Hour</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={handleExportData}
                  disabled={isExporting}
                  sx={{ flex: 1, minWidth: '120px' }}
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  sx={{ flex: 1, minWidth: '120px' }}
                >
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    style={{ display: 'none' }}
                  />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Backup sx={{ mr: 1 }} />
                System Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                    <Typography variant="h6" color="primary.main">v1.0.0</Typography>
                    <Typography variant="body2" color="text.secondary">Version</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                    <Typography variant="h6" color="success.main">10{storageStats.pattas}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Pattas</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                    <Typography variant="h6" color="warning.main">{storageStats.used} KB</Typography>
                    <Typography variant="body2" color="text.secondary">Storage Used</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                    <Typography variant="h6" color="info.main">Sept 24, 2025</Typography>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Storage Usage Bar */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Storage Usage: {storageStats.used}KB / {storageStats.total}MB
                </Typography>
                <Box sx={{ 
                  width: '100%', 
                  height: 8, 
                  bgcolor: 'grey.200', 
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    width: `${(storageStats.used / (storageStats.total * 1024)) * 100}%`, 
                    height: '100%', 
                    bgcolor: 'primary.main',
                    borderRadius: 4
                  }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Email Configuration Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            Configure Email Notifications
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={emailForm.email}
              onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
              helperText="Enter the email address where you want to receive notifications"
              margin="normal"
            />
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Notification Types
            </Typography>
            
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailForm.types.includes('pdfGenerated')}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...emailForm.types, 'pdfGenerated']
                          : emailForm.types.filter(type => type !== 'pdfGenerated');
                        setEmailForm({ ...emailForm, types: newTypes });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        📄 PDF Generated
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get notified when a PDF is successfully generated
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailForm.types.includes('statusUpdates')}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...emailForm.types, 'statusUpdates']
                          : emailForm.types.filter(type => type !== 'statusUpdates');
                        setEmailForm({ ...emailForm, types: newTypes });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        📊 Status Updates
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Get updates about patta processing status
                      </Typography>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailForm.types.includes('systemAlerts')}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...emailForm.types, 'systemAlerts']
                          : emailForm.types.filter(type => type !== 'systemAlerts');
                        setEmailForm({ ...emailForm, types: newTypes });
                      }}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        🚨 System Alerts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Important system notifications and alerts
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </FormControl>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                📧 <strong>Email Service Info:</strong> This demo uses console logging. 
                In production, integrate with EmailJS, SendGrid, or similar service for actual email delivery.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEmailConfig}
            variant="contained"
            disabled={!emailForm.email || emailForm.types.length === 0}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;