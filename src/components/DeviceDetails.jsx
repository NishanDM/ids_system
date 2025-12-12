import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import deviceModels from '../data/deviceModels.json';
import deviceColors from '../data/deviceColors.json';

const capacityOptions = ['NULL', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB', '8TB'];

const DeviceDetails = ({ formData, setFormData }) => {
  const [filteredModels, setFilteredModels] = useState([]);
  const selectedColors = deviceColors[formData.model] || [];

  useEffect(() => {
    if (formData.deviceType) {
      setFilteredModels(deviceModels[formData.deviceType] || []);
    } else {
      setFilteredModels([]);
    }
  }, [formData.deviceType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name === 'deviceType') {
      setFormData((prev) => ({
        ...prev,
        deviceType: finalValue,
        model: '',
        color: '',
      }));
      return;
    }

    if (name === 'model') {
      setFormData((prev) => ({
        ...prev,
        model: finalValue,
        color: '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const resetSection = () => {
    setFormData((prev) => ({
      ...prev,
      deviceType: '',
      model: '',
      series: '',
      emei: '',
      capacity: '',
      color: '',
      passcode: '',
      simTrayCollected: false,
      simTraySerial: '',
    }));
  };

  return (
    <Box>
            <Box mt={5}>
      <Divider textAlign="center">
        <Typography variant="h6" color="info">
          DEVICE DETAILS
        </Typography>
      </Divider>
    </Box>
      <Grid container spacing={2}  mt={3}>
        {/* Device Type */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={Object.keys(deviceModels)}
            value={formData.deviceType}
            onChange={(event, newValue) => handleChange({ target: { name: 'deviceType', value: newValue } })}
            renderInput={(params) => <TextField {...params} label="Device Type" />}
            freeSolo
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Model */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={filteredModels}
            value={formData.model}
            onChange={(event, newValue) => handleChange({ target: { name: 'model', value: newValue } })}
            renderInput={(params) => <TextField {...params} label="Model" required />}
            freeSolo
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:250
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Serial Number */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Serial Number"
            name="series"
            value={formData.series}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:200
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* EMEI */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField label="EMEI" name="emei" value={formData.emei} onChange={handleChange} fullWidth
          size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:180
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Capacity */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:180
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            {capacityOptions.map((cap, idx) => (
              <MenuItem key={idx} value={cap}
              size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
              >
                {cap}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Color */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            options={selectedColors}
            value={formData.color}
            onChange={(event, newValue) => handleChange({ target: { name: 'color', value: newValue } })}
            renderInput={(params) => <TextField {...params} label="Color" />}
            freeSolo
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Passcode */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Passcode / Pattern"
            name="passcode"
            value={formData.passcode}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* SIM Tray */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.simTrayCollected}
                onChange={handleChange}
                name="simTrayCollected"
                size="small"
               
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
              />
            }
            label="SIM Tray Collected"
          />
          {formData.simTrayCollected && (
            <TextField
              label="SIM Tray Serial"
              name="simTraySerial"
              value={formData.simTraySerial}
              onChange={handleChange}
              fullWidth
              size="small"
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:150
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
              
              
            />
          )}
        </Grid>
      </Grid>

      {/* Reset Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={resetSection} size='small'>
          Reset Device Details
        </Button>
      </Box>
    </Box>
  );
};

export default DeviceDetails;
