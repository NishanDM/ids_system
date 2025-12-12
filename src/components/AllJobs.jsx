import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from "jspdf";
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Button, TextField, Snackbar } from '@mui/material';
import ViewJobModal from './ViewJobModal';
import { Radio, RadioGroup, FormControlLabel } from "@mui/material";
import MakeBillForJob from './MakeBillForJob';
import JobEdit from "./JobEdit";
import EditJobModal from './EditJobModal';

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressFilter, setProgressFilter] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openManualJobEdit, setOpenManualJobEdit] = useState(false);
  const [openEditJobModal, setOpenEditJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState(null);


  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setJobs(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleView = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

    const handleViewForEdit = (job) => {
    setSelectedJob(job);
    setIsViewing(true);
  };

  const showSnackbar = (message) => {
  setSnackbarMessage(message);
  setSnackbarOpen(true);
};
  
  //================================= OPEN THE BILL MODAL  ==============================
  // Inside AllJobs component, near the other useState hooks:
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedJobForBilling, setSelectedJobForBilling] = useState(null);

// Function to open the Bill modal
const openMakeBillForJobModal = (job) => {
  setSelectedJobForBilling(job);
  setIsModalOpen(true);
    // Log full job details to the console
  console.log("Selected Job for Billing:", JSON.stringify(job, null, 2));
};

// Function to close the Bill modal
const closeMakeBillForJobModal = () => {
  setSelectedJobForBilling(null);
  setIsModalOpen(false);
};


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const columns = [
    { id: 'jobRef', label: 'IDSJBN', minWidth: 70 },
    { id: 'customerName', label: 'Cust: Name', minWidth: 150 },
    { id: 'customerPhone', label: 'Phone', minWidth: 70 },
    // { id: 'createdAt', label: 'Date', minWidth: 70, format: (value) => new Date(value).toLocaleDateString(), },
    { id: 'model', label: 'Model', minWidth: 100 },
    { id: 'issues', label: 'Issues', minWidth: 100 },
    // { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'jobProgress', label: 'Progress', minWidth: 80, format: (value) => value || '-' },
    { id: 'technician', label: 'Technician', minWidth: 90, format: (value) => value || '-' },
    { id: 'actions', label: 'Actions', minWidth: 140 },
  ];

  // Filter jobs based on search query
  // const filteredJobs = jobs.filter((job) => {
  //   const query = searchQuery.toLowerCase();
  //   return (
  //     job.jobRef.toLowerCase().includes(query) ||
  //     `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`.toLowerCase().includes(query) ||
  //     job.customerPhone.toLowerCase().includes(query)
  //   );
  // });


  // ===================== PRINT THE JOB AS A PDF ============================
// ---- PDF GENERATOR FUNCTION ----
const generateJobPDF = (data, billNumber) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [210, 148],
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const columnGap = 5;
  const columnWidth = (pageWidth - margin * 2 - columnGap) / 2;

  const addTextLine = (text, x, y, maxWidth, fontSize = 7, fontStyle = "normal") => {
    doc.setFont("Helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.text(text, x, y, { maxWidth });
  };

  const printSection = (yOffset = 0) => {
    let leftY = margin + yOffset;
    let rightY = margin + yOffset;
    const leftX = margin;
    const rightX = margin + columnWidth + columnGap;

    // Title
    addTextLine("IDS - JOB - NOTE (Technician Copy)", leftX, leftY, columnWidth, 9, "bold");
    leftY += 6;

    // Right side header
    addTextLine("Invoice", rightX, rightY, columnWidth, 10, "bold");
    rightY += 6;
    addTextLine(billNumber, rightX, rightY, columnWidth, 9);
    rightY += 5;

    // LEFT COLUMN
    const leftContent = [
      ["Job Ref", data.jobRef],
      // ["Created Date", data.createdDate],
      ["Created By", data.createdBy],
      ["Customer Name", `${data.customerPrefix ? data.customerPrefix + " " : ""}${data.customerName || ""}`],
      ["Phone", data.customerPhone],
      ["Device Type", data.deviceType],
      ["Model", data.model],
      ["Serial No", data.series],
      ["IMEI", data.emei],
      ["Capacity", data.capacity],
      ["Color", data.color],
      ["Passcode", data.passcode],
    ];

    leftContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, leftX, leftY, columnWidth);
      leftY += 5;
    });

    // RIGHT COLUMN
    const rightContent = [
      ["Technician", data.technician],
      ["Status", data.status],
      ["Under Warranty", data.underWarranty],
    ];

    rightContent.forEach(([label, value]) => {
      addTextLine(`${label}: ${value || "-"}`, rightX, rightY, columnWidth);
      rightY += 5;
    });

    // Customer Reported
    if (data.customer_reported?.length) {
      addTextLine("Customer Reported:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.customer_reported.forEach((item) => {
        addTextLine(`- ${item}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    // Faults Found
    if (data.faults?.length) {
      rightY += 2;
      addTextLine("Faults Found:", rightX, rightY, columnWidth, 7, "bold");
      rightY += 4;
      data.faults.forEach((fault) => {
        addTextLine(`- ${fault}`, rightX + 2, rightY, columnWidth - 2);
        rightY += 4;
      });
    }

    // Remarks
    rightY += 3;
    addTextLine("Remarks:", rightX, rightY, columnWidth, 7, "bold");
    rightY += 4;
    addTextLine(data.remarks || "-", rightX + 2, rightY, columnWidth);

    // Empty Notes Box & Signature
    let boxY = Math.max(leftY, rightY) + 10;
    const boxHeight = 25;
    const boxWidth = pageWidth - margin * 2;

    addTextLine(
      "Technician Notes            Done:......        Returned:......                                                                                    Job Maker Sign:.......................................",
      leftX,
      boxY - 4,
      boxWidth,
      8,
      "bold"
    );

    doc.setDrawColor(0);
    doc.rect(leftX, boxY, boxWidth, boxHeight);

    const signY = boxY + boxHeight + 10;
    addTextLine("Tech Sign: .................................................", leftX, signY, boxWidth, 8);
  };

  // Print section
  printSection(0);

  // File name    
  let jobRefName = data?.jobRef?.trim();
  if (!jobRefName || jobRefName === "") {
    jobRefName = billNumber?.trim() || "JobNote";
  }
  jobRefName = jobRefName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fileName = `${jobRefName}.pdf`;

  // Open + Print + Save
  const blob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(blob);
  const newTab = window.open(pdfUrl, "_blank");
  if (newTab) {
    newTab.onload = function () {
      newTab.focus();
      newTab.print();
      doc.save(fileName);
    };
  } else {
    alert("Popup blocked! Please allow popups for this site to view the PDF. PDF downloaded instead.");
  }
};

const filteredJobs = jobs.filter((job) => {
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


  // Normalize jobProgress
  const progress = job.jobProgress?.toLowerCase() || "";

  // Handle progress filter conditions
  const matchesProgress =
    progressFilter === "all" ||
    (progressFilter === "Just_started" &&
      (progress.includes("pending") || progress.includes("just_started"))) ||
    (progressFilter === "Closed By Bill" &&
      progress.startsWith("closed by bill")) ||
    (progressFilter === "Hold" && progress === "hold") ||
    (progressFilter === "Waiting For Parts" && progress === "waiting for parts") ||
    (progressFilter === "Returned" && progress === "returned") ||
    (progressFilter === "Completed" && progress === "completed") ||
    (progressFilter === "Canceled" && progress === "canceled");

  return matchesSearch && matchesProgress;
});


// ---- PRINT HANDLER ----
const handlePrint = (job) => {
  if (!job) return;

  const now = new Date();
  const billNumber = `IDSBN-${now.getMonth() + 1}-${now.getFullYear()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;

  const data = {
    jobRef: job.jobRef || "-",
    createdDate: job.createdAt
      ? new Date(job.createdAt).toLocaleDateString()
      : "-",
    createdBy: job.createdBy || "-",
    customerPrefix: job.customerPrefix || "",
    customerName: job.customerName || "-",
    customerPhone: job.customerPhone || "-",

    deviceType: job.deviceType || "-",
    model: job.model || "-",
    series: job.series || "-",
    emei: job.emei || "-",
    capacity: job.capacity || "-",
    color: job.color || "-",
    passcode: job.passcode || "-",

    technician: job.technician || "-",
    status: job.status || "-",
    underWarranty: job.underWarranty || "-",

    customer_reported: Array.isArray(job.customer_reported)
      ? job.customer_reported
      : [],

    faults: Array.isArray(job.faults)
      ? job.faults
      : [],

    remarks: job.remarks || "-",
  };

  generateJobPDF(data, billNumber);
};


const getRowColor = (progress = "") => {
  const p = progress.toLowerCase();

  if (p === "completed") return "rgba(144, 238, 144, 0.3)"; // light green
  if (p.startsWith("closed by bill")) return "rgba(224, 255, 255, 0.6)"; // very light cyan
  if (p === "canceled" || p === "returned") return "rgba(255, 182, 193, 0.3)"; // very light red/pink
  if (p === "hold") return "rgba(255, 255, 204, 0.5)"; // very light yellow
  if (p === "just_started" || p === "pending") return "inherit"; // no special color

  return "inherit";
};

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      

        {/* Progress Filter */}
<div style={{ margin: "4px 0" }}>
 

  <RadioGroup row value={progressFilter}  onChange={(e) => setProgressFilter(e.target.value)} >
    <FormControlLabel value="all" control={<Radio />} label="All"/>
    <FormControlLabel value="Just_started" control={<Radio />} label="Pending & Just Started" />
    <FormControlLabel value="Closed By Bill" control={<Radio />} label="Finished" />    
    <FormControlLabel value="Hold" control={<Radio />} label="Hold" />
    <FormControlLabel value="Waiting For Parts" control={<Radio />} label="Waiting For Parts" />
    <FormControlLabel value="Returned" control={<Radio />} label="Returned" />
    <FormControlLabel value="Canceled" control={<Radio />} label="Canceled" />
    <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
    <Button onClick={() => setOpenManualJobEdit(true)} variant="contained" size="small" sx={{ mr: 1, fontSize: "0.8rem", minWidth: "0", lineHeight: 1.2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>Job Edit Manual</Button>
    
  </RadioGroup>
</div>
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

      {loading && <p>Loading jobs...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && filteredJobs.length > 0 && (
        <>


          <TableContainer sx={{ maxHeight: 800 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ minWidth: column.minWidth }}
                      align={column.align}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((job) => (
                    <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={job._id}
                            sx={{
                              backgroundColor: getRowColor(job.jobProgress),  // ← NEW
                                  // 🔥 Reduce row height
                                "& .MuiTableCell-root": {
                                  padding: "4px 8px",      // Smaller padding
                                  fontSize: "0.8rem",      // Smaller text
                                  lineHeight: "1.1rem",    // More compact
                                },

                              // Keep your existing highlight on search
                              ...(searchQuery &&
                              (job.jobRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                `${job.customerPrefix ? job.customerPrefix + ' ' : ''}${job.customerName}`
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                job.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()))
                                ? { backgroundColor: "rgba(255, 235, 59, 0.3)" }  // search highlight
                                : {})
                            }}
                          >

                      {columns.map((column) => {
                        if (column.id === 'actions') {
                          const progress = (job.jobProgress || "").toLowerCase().trim();
                          const isClosed = progress === "completed" || progress.startsWith("closed by bill");
                          return (
                            <TableCell key={column.id}>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleView(job)}
                                      sx={{ 
                                        mr: 1, 
                                        fontSize: "0.8rem",
                                        minWidth: "0",
                                        lineHeight: 1.2,
                                        backgroundColor: '#1976d2', 
                                        '&:hover': { backgroundColor: '#1565c0' } 
                                      }}
                                    >
                                      View
                                    </Button>

                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handlePrint(job)}
                                      sx={{ 
                                        mr: 1,
                                        fontSize: "0.8rem",
                                        minWidth: "0",
                                         lineHeight: 1.2,
                                        backgroundColor: '#2e7d32',   // Green
                                        '&:hover': { backgroundColor: '#1b5e20' } 
                                      }}
                                    >
                                      Print
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                          setSelectedJobForEdit(job);
                                          setOpenEditJobModal(true);
                                        }}
                                        disabled={isClosed} // disables the button if job is completed/closed
                                        sx={{ 
                                          mr: 1, 
                                          fontSize: "0.8rem",
                                          minWidth: "0",
                                          lineHeight: 1.2,
                                          backgroundColor: "#f5f5f5", // very light gray for enabled
                                          color: "#000000",            // black text
                                          '&:hover': { 
                                            backgroundColor: "#ffe5b4" // slightly darker gray on hover
                                          } 
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    <Button
                                      variant="contained"
                                      size="small"
                                        onClick={() => {
                                          if ((job.jobProgress || "").toLowerCase() === "completed") {
                                            openMakeBillForJobModal(job);
                                          } else {
                                            showSnackbar("Cannot make a bill yet. Please update the job progress into COMPLETED");
                                          }
                                        }}
                                      sx={{ 
                                          fontSize: "0.8rem",
                                          minWidth: "0",
                                          lineHeight: 1.2,
                                          backgroundColor: '#d32f2f',   // Red
                                          '&:hover': { backgroundColor: '#b71c1c' } // Darker red on hover
                                        }}
                                    >
                                      Bill
                                    </Button>
                                  </TableCell>
                          );
                        }

                      let value;
                        if (column.id === "customerName") {
                          value = `${job.customerPrefix ? job.customerPrefix + " " : ""}${job.customerName}`;
                        } 
                        else if (column.id === "model") {
                          value = [
                            job.deviceType || "-",
                            job.model || "-",
                            job.series || "-",
                            job.emei || "-"
                          ].join(" | ");
                        } 
                        else if (column.id === "issues") {
                          value = Array.isArray(job.faults) && job.faults.length > 0 ? job.faults.join(", ") : "-";
                        } 
                        else if (column.id === "jobRef") {
                          // Remove "IDSJBN-" prefix if exists
                          value = job.jobRef?.replace(/^IDSJBN-/, "") || "-";
                        }
                        else {
                          value = job[column.id];
                        }
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && value !== undefined ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[20, 40, 100]}
            component="div"
            count={filteredJobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}

      {isViewing && selectedJob && (
        <ViewJobModal job={selectedJob} onClose={() => setIsViewing(false)} />
      )}
{openEditJobModal && selectedJobForEdit && (
  <EditJobModal
    editData={selectedJobForEdit}
    setEditData={setSelectedJobForEdit}
    onClose={() => setOpenEditJobModal(false)}
  />
)}

      {/* Bill Modal */}
<MakeBillForJob    open={isModalOpen}    onClose={closeMakeBillForJobModal}    job={selectedJobForBilling}  />
<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000} // 3 seconds
  onClose={() => setSnackbarOpen(false)}
  message={snackbarMessage}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
/>
{openManualJobEdit && (
        <JobEdit onClose={() => setOpenManualJobEdit(false)} />
      )}
    </Paper>
  );
}
