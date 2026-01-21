import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Pages/Layout";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./Pages/Dashboard";
import Form from "./Pages/Form";
import Overview from "./Pages/Overview";
import Register from "./auth/Register";
import Login from "./auth/Login";
import List from "./admin/List";
import Alldrivers from "./admin/Alldrivers";
import CallHistory from "./admin/CallHistory";
import Clientlist from "./admin/Clientlist";
import History from "./Pages/History";
import Violationlog from "./Pages/Violationlog";
import ViolationFrom from "./admin/ViolationFrom";
import ViolationTable from "./admin/ViolationTable";
import DriverPerformanceAnalytics from "./admin/DrivercallEarningGraph";
import CallGraph from "./admin/CallGraph";
import CallRecorded from "./admin/AllCallRecord";
import CallsList from "./admin/CallsList";

// Helper: Check if token is valid (not expired)
const isTokenValid = () => {
  const token = localStorage.getItem("authToken");

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    const exp = payload.exp * 1000; // exp is in seconds
    if (Date.now() >= exp) {
      localStorage.removeItem("authToken"); // Auto cleanup expired token
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Invalid token format, logging out...");
    localStorage.removeItem("authToken");
    return false;
  }
};

// Enhanced Protected Route
const Protected = ({ children }) => {
  if (!isTokenValid()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Prevent access to login/register if already logged in
const NoAuth = ({ children }) => {
  if (isTokenValid()) {
    return <Navigate to="/driver/dashboard" replace />;
  }
  return children;
};

// App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect if already logged in */}
        <Route
          path="/"
          element={
            <NoAuth>
              <Login />
            </NoAuth>
          }
        />
        <Route
          path="/login"
          element={
            <NoAuth>
              <Login />
            </NoAuth>
          }
        />
        <Route
          path="/register"
          element={
            <NoAuth>
              <Register />
            </NoAuth>
          }
        />

        {/* Driver Protected Routes */}
        <Route
          path="/driver"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="overview" element={<Dashboard />} />
          <Route path="form" element={<Form />} />
          <Route path="violationlog" element={<Violationlog />} />
          <Route path="dashboard" element={<Overview />} />
          <Route path="callrecord" element={<History />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="alldrivers" replace />} />
          <Route path="list" element={<List />} />
          <Route path="alldrivers" element={<Alldrivers />} />
          <Route path="callhistory/:driverId" element={<CallHistory />} />
          <Route path="clientlist" element={<Clientlist />} />
          <Route path="callslist" element={<CallsList />} />

          <Route path="violationform" element={<ViolationFrom />} />
          <Route path="violationtable" element={<ViolationTable />} />
          <Route path="earning" element={<DriverPerformanceAnalytics />} />
          <Route path="calls" element={<CallGraph />} />
          <Route path="calls-records" element={<CallRecorded />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;