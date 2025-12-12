import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle} from "react-icons/fa";


import JobForm from "../components/JobForm";
import AllJobs from "../components/AllJobs";
import Register from "../components/Register";
import MyJobs from "../components/MyJobs";
import EditProfile from "../components/EditProfile";
import GRN from "../stock_GRN/GRN";
import MakeBill from "../components/MakeBill"
import StockModal from "../stock_GRN/StockModal";
import BillsModal from "../stock_GRN/BillsModal";
import ManualStock from "../stock_GRN/ManualStock";
import LowItemNotifications from "../components/LowItemNotifications";
import BillEdit from "../stock_GRN/BillEdit";
import DamagedParts from "../components/DamagedParts";

const CreatorProfile = () => {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");
  const user = JSON.parse(localStorage.getItem("user"));
  const handleCloseGRN = () => setActiveTab("welcome");
  const handleCloseMakeBill = () => setActiveTab("welcome");
  const handleCloseStock = () => setActiveTab ("welcome");
  const handleCloseBillsModal = () => setActiveTab ("welcome");
  const handleCloseManualStock = () => setActiveTab ("welcome");
  const handleCloseBillEdit = () => setActiveTab ("welcome");
  const handleCloseDamagedParts = () => setActiveTab ("welcome");
  useEffect(() => {
    const blockBack = () => {
      // Re-push the same state to prevent leaving
      window.history.pushState(null, "", window.location.href);
      alert("Back navigation is disabled on this page!");
    };

    // Always push a dummy state when page loads (even after refresh)
    window.history.pushState(null, "", window.location.href);

    // Listen for back/forward navigation
    window.addEventListener("popstate", blockBack);
        // Warn on tab close or refresh
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome
      // Modern browsers ignore custom messages, but will show a confirmation dialog
    };
     window.addEventListener("beforeunload", handleBeforeUnload);

    // Optional: prevent leaving on refresh or closing tab
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });

    return () => {
      window.removeEventListener("popstate", blockBack);
      window.removeEventListener("beforeunload", () => {});
    };
  }, []);
  // ---- Logout ----
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if(confirmLogout){
        localStorage.removeItem("user");
    navigate("/");
    }
  };

  const handleMouseEnter = () => setShowSidebar(true);
  const handleMouseLeave = () => setShowSidebar(false);

  const navItems = [
    { id: "createJob", label: "NEW-JOB" },
    { id: "myJobs", label: "MY-JOBS" },
    { id: "allJobs", label: "ALL-JOBS" },
    { id: "registerTechnician", label: "REGISTER" },
    { id: "grn", label: "GRN" },
    { id: "bill", label: "BILL" },
    { id: "stock", label: "STOCK" },
    { id: "invoices", label: "INVS" },
    { id: "damaged_parts", label: "DAMAGE" }
    // { id: "bill_edit", label: "BILL-EDIT" },
    // { id: "manual_stock", label: "MANUAL" },
    
  ];

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 flex justify-between items-center z-50">
        <div className="text-xl font-bold text-blue-600">
          Job Creator Dashboard
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-gray-700 font-medium">
            {user?.email}
          </span>


          {/* Profile Icon */}
          <div
            onClick={() => setActiveTab("editProfile")}
            className="cursor-pointer"
          >
            <FaUserCircle size={28} className="text-gray-700" />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-md font-semibold transition hover:bg-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Area */}
      <div className="flex flex-1 relative pt-20">
        {/* Hover Trigger Area */}
        <div
          className="fixed top-20 left-0 h-full w-4 z-50"
          onMouseEnter={handleMouseEnter}
        />

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-52 bg-gray-900/20 backdrop-blur-lg shadow-lg transform transition-all duration-300 ease-in-out z-40
            ${showSidebar ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col gap-2 text-sm mt-20 px-4">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  activeTab === id
                    ? "bg-orange-500 text-white"
                    : "bg-cyan-700 text-white hover:bg-yellow-400 hover:text-gray-950 hover:cursor-pointer"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-10 transition-all duration-300 overflow-y-auto">
          {activeTab === "welcome" && (
            <>
              <h1 className="text-3xl font-bold text-black mb-2 text-center">
                Welcome, {user?.username}!
              </h1>
              <p className="text-gray-800 text-lg text-center">
                Move your cursor to left to manage jobs, technicians, and your profile.
              </p>
              <LowItemNotifications />
            </>
          )}
          {activeTab === "createJob" && <JobForm />}
          {activeTab === "myJobs" && <MyJobs />}
          {activeTab === "allJobs" && <AllJobs />}
          {activeTab === "registerTechnician" && <Register />}
          {activeTab === "editProfile" && <EditProfile />}
          {activeTab === "grn" && <GRN onClose={handleCloseGRN}/>}
          {activeTab === "bill" && <MakeBill  onClose={handleCloseMakeBill}/>}
          {activeTab === "stock" && <StockModal  onClose={handleCloseStock}/>}
          {activeTab === "invoices" && <BillsModal  onClose={handleCloseBillsModal}/>}
          {activeTab === "manual_stock" && <ManualStock  onClose={handleCloseManualStock}/>}
          {activeTab === "bill_edit" && <BillEdit  onClose={handleCloseBillEdit}/>}
          {activeTab === "damaged_parts" && <DamagedParts  onClose={handleCloseDamagedParts}/>}
        </main>
      </div>
    </div>
  );
};

export default CreatorProfile;
