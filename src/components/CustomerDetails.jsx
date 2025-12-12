import React from "react";
import { Grid, TextField, MenuItem, Button, Box, Typography,Divider } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import axios from "axios";

const CustomerDetails = ({ formData, setFormData }) => {
  const isPhoneInvalid = formData.customerPhone.length > 0 && formData.customerPhone.length !== 10;
  const isNameInvalid =
  formData.customerName.trim().length > 0 &&
  formData.customerName.trim().split(/\s+/).length < 2;
  const isPhoneValid = formData.customerPhone.length === 10;


//   const handleChange = (e) => {
//   const { name, value } = e.target;

//   // Allow only digits for phone fields
//   if (name === "customerPhone" || name === "customerAlterPhone") {
//     if (!/^[A-Za-z\s]*$/.test(value)) return;
//     if (!/^\d*$/.test(value)) return; // allow digits only
//     if (value.length > 10) return;    // max 10 digits
//   }

//   setFormData((prev) => ({ ...prev, [name]: value }));
// };

const handleChange = (e) => {
  const { name, value } = e.target;

  // Validation for NAME field (letters + spaces only)
  if (name === "customerName") {
    if (!/^[A-Za-z\s]*$/.test(value)) return;
  }

  // Validation for PHONE fields (digits only)
  if (name === "customerPhone" || name === "customerAlterPhone") {
    if (!/^\d*$/.test(value)) return;  // allow digits only
    if (value.length > 10) return;     // max length 10
  }

  setFormData((prev) => ({ ...prev, [name]: value }));
};



  const resetSection = () => {
    setFormData((prev) => ({
      ...prev,
      customerPrefix: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAlterPhone: "",
      customerCompany: "",
      customerAddress: "",
    }));
  };

  const handleSearchCustomer = async () => {
    const phone = formData.customerPhone;
    if (phone.length !== 10) {
    alert("Phone number must be 10 digits");
    return;
  }
    if (!phone) {
      alert("Please enter a phone number to search");
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/customers/by-phone/${phone}`
      );
      if (res.status === 200) {
        const customer = res.data;
        setFormData((prev) => ({
          ...prev,
          customerPrefix: customer.prefix || "",
          customerName: customer.name || "",
          customerEmail: customer.email || "",
          customerAlterPhone: customer.alterPhone || "",
          customerCompany: customer.company || "",
          customerAddress: customer.address || "",
        }));
        alert("✅ Customer details filled successfully");
      }
    } catch (err) {
      console.error("Error fetching customer:", err);
      alert("❌ Customer not found");
    }
  };

  return (
    <Box mb={3} mt={5}>
      <Box mt={5}>
      <Divider textAlign="center" >
        <Typography variant="h6" color="info">
          CUSTOMER DETAILS
        </Typography>
      </Divider>
    </Box>
      <Grid container spacing={2} mt={3}>
        {/* Prefix */}
        <Grid item xs={12} sm={2}>
          <TextField
            select
            label="Prefix"
            name="customerPrefix"
            value={formData.customerPrefix}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:100
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          >
            {["none", "Mr", "Mrs", "Ms", "Ven.", "Dr", "Rev."].map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Name */}
        <Grid item xs={12} sm={4}>
          <TextField
                label="Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                error={isNameInvalid}
                helperText={isNameInvalid ? "Please enter first name and last name (e.g., John Robert)" : ""}
                size="small"
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: 12,
                    height: 28,
                    padding: "0 8px",
                    color: "black",
                    width: 300
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: 12,
                    color: "black",
                    fontWeight: "bold"
                  },
                }}
              />
        </Grid>

        {/* Phone + Search */}
        <Grid item xs={12} sm={3}>
          <Box display="flex">
            <TextField
                  label="Phone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  error={isPhoneInvalid}
                  helperText={isPhoneInvalid ? "Phone number must be exactly 10 digits" : ""}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: 12,
                      height: 28,
                      padding: "0 8px",
                      color: "black",
                      width: 170
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: 12,
                      color: "black",
                      fontWeight: "bold"
                    },
                  }}
                />

            {isPhoneValid && (
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 0.5, minWidth: 32, px: 0.5 }}
                onClick={handleSearchCustomer}
                disabled={!isPhoneValid}
              >
                <FaSearch size={12} />
              </Button>
            )}

          </Box>
        </Grid>

        {/* Another Phone */}
        <Grid item xs={12} sm={3}>
          <TextField
            label="Another Phone Number"
            name="customerAlterPhone"
            value={formData.customerAlterPhone}
            onChange={handleChange}
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            required
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width: 350
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Company */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Company"
            name="customerCompany"
            value={formData.customerCompany}
            onChange={handleChange}
            required
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                padding: "0 8px",
                color: "black",
                width:560
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>

        {/* Address */}
        <Grid item xs={12} sm={4}>
          <TextField
            label="Address"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            required
            size="small"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: 12,
                height: 28,
                color: "black",
                width:620
              },
              "& .MuiInputLabel-root": {
                fontSize: 12,
                color: "black",
                fontWeight: "bold"
              },
            }}
          />
        </Grid>
      </Grid>

      {/* Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
        <Button variant="contained" color="info" size="small" onClick={resetSection}>
          Reset Customer Details
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerDetails;
