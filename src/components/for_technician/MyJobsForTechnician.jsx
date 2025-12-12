import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button, Box } from '@mui/material';
import TextField from "@mui/material/TextField"; 
import ViewJobModal from './ViewJobModal';
import EditJobModal from "../../components/EditJobModal";


const MyJobsForTechnician = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const user = JSON.parse(localStorage.getItem('user'));
  const [searchQuery, setSearchQuery] = useState('');
  const [progressFilter, setProgressFilter] = useState("all");

  // Format dates (handles ISO strings, MongoDB objects, or "YYYY-MM-DD")
  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = typeof date === "object" && date.$date ? date.$date : date;
    const d = new Date(parsedDate);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US");
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const filtered = res.data.filter(job => job.technician === user?.username);

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt?.$date || b.createdAt) - new Date(a.createdAt?.$date || a.createdAt)
      );

      setJobs(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.username]);

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

  const handleEdit = (job) => {
    setEditData(job);
    setIsEditing(true);
  };

const [open, setOpen] = useState({ open: false, jobRef: "" });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${editData._id}`, editData);
      alert('✅ Job updated successfully!');
      setIsEditing(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update job.');
    }
  };

  // Map jobs to DataGrid rows
  const rows = jobs
  .filter((job) => {
  const query = searchQuery.toLowerCase();

  // const matchesSearch =
  //   job.jobRef.toLowerCase().includes(query) ||
  //   `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`
  //     .toLowerCase()
  //     .includes(query) ||
  //   job.customerPhone.toLowerCase().includes(query);

  const matchesSearch =
  job.jobRef.toLowerCase().includes(query) ||
  `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`
    .toLowerCase()
    .includes(query) ||
  job.customerPhone.toLowerCase().includes(query) ||
  (job.series || "").toLowerCase().includes(query) ||      // Serial number
  (job.emei || "").toLowerCase().includes(query) ||        // IMEI
  (job.model || "").toLowerCase().includes(query) ||       // Model
  (job.deviceType || "").toLowerCase().includes(query) ||  // Device Type (iPhone, iPad, etc)
  (job.capacity || "").toLowerCase().includes(query) ||    // Storage capacity
  (job.color || "").toLowerCase().includes(query);         // Color

  return matchesSearch;
})
  
  
  .map(job => ({
    id: job._id,
    jobRef: job.jobRef?.replace(/^IDSJBN-/, "") || "",
    customerPrefix: job.customerPrefix,
    customerName: `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`,
    createdAt: formatDate(job.createdAt),
    customerPhone: job.customerPhone,
    
    faults: Array.isArray(job.faults)
      ? job.faults.filter(Boolean).join(" | ")
      : "",
    // 👇 ADD THIS
  fullDeviceInfo: [
    job.model,
    job.deviceType,
    job.series,
    job.emei
  ].filter(Boolean).join(" | "), // remove empty and join nicely
    status: job.status,
    progress: job.jobProgress || '-',
    createdBy: job.createdBy,
    jobObj: job, // full job object for actions
  }));

  const columns = [
    { field: 'jobRef', headerName: 'Job Ref', width: 100 },
    { field: 'customerName', headerName: 'Customer Name', width: 250 },
    { field: 'customerPhone', headerName: 'Phone', width: 110 },
    { field: 'createdAt', headerName: 'Created Date', width: 120 },
    { field: 'fullDeviceInfo', headerName: 'Device Details', width: 460 },
    { field: 'faults', headerName: 'Faults', width: 400 },
    // { field: 'status', headerName: 'Status', width: 90 },
    { field: 'progress', headerName: 'Progress', width: 190 },
    // { field: 'createdBy', headerName: 'Created By', width: 130 },
    
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const job = params.row.jobObj;
        const isClosed =
      job.jobProgress &&
      job.jobProgress.toLowerCase().includes("closed by bill");
        return (
          <Box display="flex" gap={1} padding={1}>
            <Button
              variant="contained"
              size="small"
              sx={{
                            mt: 0,
                            mb: 0.7,
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            minWidth: "0",
                            lineHeight: 1.2,
                          }}
              onClick={() => handleView(job)}
            >
              View
            </Button>
            <Button
                          variant="contained"
                          size="small"
                          color="error"
                          disabled={isClosed}
                          onClick={() => handleEdit(job)}
                          sx={{
                            mt: 0,
                            mb: 0.7,
                            padding: "2px 6px",
                            fontSize: "0.8rem",
                            minWidth: "0",
                            lineHeight: 1.2,
                          }}
                        >
                          Edit
                        </Button>
          </Box>
        );
      },
    },
  ];

  const getRowColor = (p) => {
  if (!p) return "inherit";
  const progress = p.toLowerCase().trim();

  if (progress === "completed") return "rgba(144, 238, 144, 0.3)"; // light green
  if (progress.startsWith("closed by bill")) return "rgba(224, 255, 255, 0.6)"; // very light cyan
  if (progress === "canceled" || progress === "returned")
    return "rgba(255, 182, 193, 0.3)"; // light pink
  if (progress === "hold" || progress === "taken" ) return "rgba(255, 255, 204, 0.5)"; // light yellow
  if (progress === "just_started" || progress === "pending") return "inherit";

  return "inherit";
};
useEffect(() => {
  // Remove old dynamic styles to avoid duplicates
  const oldStyles = document.querySelectorAll("style[data-row-style]");
  oldStyles.forEach(s => s.remove());

  jobs.forEach(job => {
    const color = getRowColor(job.jobProgress);
    const style = document.createElement("style");
    style.dataset.rowStyle = job._id;
    style.innerHTML = `
      .row-${job._id} {
        background-color: ${color} !important;
      }
    `;
    document.head.appendChild(style);
  });
}, [jobs]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4"> My Jobs</h2>
      {/* Search Bar */}
      <TextField
        fullWidth
        size="small"
        label="Search by Job Ref, Customer Name, Phone, Serial, EMEI, Model or Type"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
         sx={{
    mb: 2,
    "& .MuiInputBase-input": {
      padding: "6px 10px",   // ↓ smaller height
    },
    "& .MuiInputLabel-root": {
      top: "-4px",           // adjust label position slightly
    }
  }}
      />
      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[20, 50, 100]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
          rowHeight={36}
          headerHeight={40}
            getRowClassName={(params) => {
    const color = getRowColor(params.row.progress);
    return color ? `row-${params.id}` : "";
  }}
        />
      </Paper>

      {isViewing && selectedJob && (
        <ViewJobModal job={selectedJob} onClose={() => setIsViewing(false)} />
      )}
{isEditing && (
        <EditJobModal
          editData={editData}
          setEditData={setEditData}
          onClose={() => setIsEditing(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default MyJobsForTechnician;
