import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Person,
  Home,
  Map,
  Description,
  CloudUpload,
  Delete,
  Send
} from '@mui/icons-material';

const ApplyClaim = () => {
  const [claimType, setClaimType] = useState('IFR');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files) {
      setUploadedFiles(prevFiles => [...prevFiles, ...Array.from(event.target.files)]);
    }
  };

  const handleRemoveFile = (fileName) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically handle form submission, e.g., send data to a server
    console.log("Claim submitted!");
    setIsSubmitted(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Apply for a New Claim
        </Typography>
        <Typography variant="subtitle1">
          Fill out the form below to submit a new Individual or Community Forest Rights claim.
        </Typography>
      </Paper>

      {isSubmitted ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">Claim Submitted Successfully!</Typography>
          <Typography>Your claim has been submitted for review. You can track its progress in the "Pending Claims" section.</Typography>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Claimant Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" /> Claimant Information
                </Typography>
                <TextField fullWidth label="Claimant Name / Group Name" margin="normal" required />
                <TextField fullWidth label="Father's / Husband's Name" margin="normal" />
                <TextField fullWidth label="Age" margin="normal" type="number" />
                 <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select label="Category">
                    <MenuItem value="ST">Scheduled Tribe (ST)</MenuItem>
                    <MenuItem value="OTFD">Other Traditional Forest Dweller (OTFD)</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Location Details */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Map color="primary" /> Location Details
                </Typography>
                <TextField fullWidth label="Village" margin="normal" required />
                <TextField fullWidth label="Gram Panchayat" margin="normal" required />
                <TextField fullWidth label="Tehsil" margin="normal" required />
                <TextField fullWidth label="District" margin="normal" required />
              </Paper>
            </Grid>

            {/* Claim Details */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" /> Claim Details
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Claim Type</InputLabel>
                  <Select value={claimType} label="Claim Type" onChange={(e) => setClaimType(e.target.value)}>
                    <MenuItem value="IFR">Individual Forest Rights (IFR)</MenuItem>
                    <MenuItem value="CFR">Community Forest Rights (CFR)</MenuItem>
                  </Select>
                </FormControl>
                <TextField fullWidth label="Area Claimed (in hectares)" margin="normal" type="number" required />
                <TextField fullWidth label="Khasra / Compartment No." margin="normal" />
              </Paper>
            </Grid>

            {/* Document Upload */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudUpload color="primary" /> Document Upload
                </Typography>
                <Button variant="contained" component="label" fullWidth>
                  Upload Documents
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </Button>
                <List dense>
                  {uploadedFiles.map((file, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(file.name)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(2)} KB`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Submission Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" startIcon={<Send />} sx={{ width: '100%', py: 2 }}>
                Submit Claim Application
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </Box>
  );
};

export default ApplyClaim;