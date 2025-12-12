import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import axios from "axios";
import EditProfile from "../components/EditProfile";
import StockModal from "../stock_GRN/StockModal";
import BillDashboard from "../stock_GRN/BillDashboard";
import BillsModal from "../stock_GRN/BillsModal";
import GRNManager from "../stock_GRN/GRNManager";
import AllJobs from "../components/AllJobs";
import BillEdit from "../stock_GRN/BillEdit";

const AccountProfile = () => {
  const handleCloseStock = () => setActiveTab ("welcome")
  const handleCloseBillDashboard = () => setActiveTab ("welcome");
  const handleCloseBillsModal = () => setActiveTab ("welcome");
  const handleCloseGRNManager = () => setActiveTab ("welcome");
  const handleCloseBillEdit = () => setActiveTab ("welcome");

  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("welcome");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.type !== "accountant") navigate("/");

    const fetchUnreadNotifications = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/accountant/notifications/unread/${user.username}`
        );
        setUnreadNotifications(res.data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadNotifications();
  }, [user, navigate]);

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
     { id: "stock", label: "STOCK" },
     { id: "billdashboard", label: "DASHBOARD" },
     { id: "invoices", label: "INVS" },
     { id: "grnManager", label: "GRN-MANAGER" },
     { id: "allJobs", label: "ALL-JOBS" },
     { id: "bill_edit", label: "BILL-EDIT" },
  ];


  //================================================================
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-4 flex justify-between items-center z-50">
        <div className="text-xl font-bold text-blue-600">
          Accountant Dashboard
        </div>

        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-gray-700 font-medium">
            {user?.email}
          </span>

          {/* Profile */}
          <div
            onClick={() => setActiveTab("editProfile")}
            className="cursor-pointer"
          >
            <FaUserCircle size={28} className="text-gray-700" />
          </div>

          {/* Logout */}
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
                Manage invoices, expenses, salaries, and reports from your dashboard.
              </p>
            </>
          )}
          {activeTab === "editProfile" && <EditProfile />}
          {activeTab === "stock" && <StockModal  onClose={handleCloseStock}/>}
          {activeTab === "billdashboard" && <BillDashboard  onClose={handleCloseBillDashboard}/>}
          {activeTab === "invoices" && <BillsModal  onClose={handleCloseBillsModal}/>}
          {activeTab === "grnManager" && <GRNManager  onClose={handleCloseGRNManager}/>}
          {activeTab === "allJobs" && <AllJobs />}
          {activeTab === "bill_edit" && <BillEdit  onClose={handleCloseBillEdit}/>}
        </main>
      </div>
    </div>
  );
};

export default AccountProfile;


