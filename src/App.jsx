import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
      <Routes>
        {/* default auth route */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* driver layout routes */}
        <Route path="/driver" element={<Layout />}>
          <Route path="overview" element={<Dashboard />} />
          <Route path="form" element={<Form />} />
          <Route path="violationlog" element={<Violationlog />} />

          <Route path="dashboard" element={<Overview />} />
          <Route path="callrecord" element={<History />} />
        </Route>

        {/* admin layout routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="list" element={<List />} />
          <Route path="alldrivers" element={<Alldrivers />} />
          <Route path="callhistory/:driverId" element={<CallHistory />} />
          <Route path="clientlist" element={<Clientlist />} />
          <Route path="violationform" element={<ViolationFrom />} />
          <Route path="violationtable" element={<ViolationTable />} />
          <Route path="earning" element={<DriverPerformanceAnalytics />} />
          <Route path="calls" element={<CallGraph />} />
          <Route path="calls-records" element={<CallRecorded />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
