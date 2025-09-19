import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./Pages/Dashboard";
import Form from "./Pages/Form";
import Overview from "./Pages/Overview";
import Register from "./auth/Register";
import Login from "./auth/Login";
import List from "./admin/List";

function App() {
  return (
    <Router>
      <Routes>
        {/* auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* driver layout routes */}
        <Route path="/" element={<Layout />}>
          <Route path="driverdashboard" element={<Dashboard />} />
          <Route path="form" element={<Form />} />
          <Route path="overview" element={<Overview />} />
        </Route>

        {/* admin layout routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="list" element={<List />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;