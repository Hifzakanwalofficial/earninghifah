import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Baseurl } from "../Config";

const ViolationForm = () => {
  const [form, setForm] = useState({
    driverId: "",
    violationNumber: "",
    plateNumber: "",
    amount: "",
    address: "",
    status: "",
    administrationFee: 0,
  });

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // ✅ Fetch all drivers (no limit)
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${Baseurl}/admin/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch drivers");
        const data = await response.json();
        setDrivers(data.drivers || []);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchDrivers();
  }, [token]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit Violation API
  const handleSubmit = async (withFee = false) => {
    if (!form.driverId || !form.violationNumber || !form.amount) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${Baseurl}/admin/createTicket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driverId: form.driverId,
          violationNumber: form.violationNumber,
          plateNumber: form.plateNumber,
          amount: Number(form.amount),
          address: form.address,
          status: form.status.toLowerCase(),
          administrationFee: withFee ? 30 : 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data.message || "Something went wrong");
        alert(data.message || "Failed to create ticket!");
        return;
      }

      // ✅ Redirect on success
      navigate("/admin/violationtable");
    } catch (error) {
      console.error("Request error:", error);
      alert("An error occurred while creating the ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-white rounded-2xl shadow-sm p-8 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">
        Traffic Violation Form
      </h2>
      <p className="text-gray-500 mb-6">
        Manage and update traffic violation details.
      </p>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Driver Name
          </label>
          <select
            name="driverId"
            value={form.driverId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver._id} value={driver._id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>

        {/* Violation Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Violation Number
          </label>
          <input
            type="text"
            name="violationNumber"
            placeholder="Enter Violation Number"
            value={form.violationNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          />
        </div>

        {/* Plate Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plate Number
          </label>
          <input
            type="text"
            name="plateNumber"
            placeholder="Enter Plate Number"
            value={form.plateNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount Charged ($)
          </label>
          <input
            type="number"
            name="amount"
            placeholder="Enter Amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            placeholder="Enter Address"
            value={form.address}
            onChange={handleChange}
            rows="2"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          ></textarea>
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DADDE2]"
          >
            <option value="">Select Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
        {/* Save Violation */}
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className="w-full md:w-1/2 bg-gray-100 text-gray-600 font-medium py-3 rounded-lg cursor-pointer hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-gray-600 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Save Violation"
          )}
        </button>

        {/* Add Admin Fee + Submit */}
        <button
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="w-full md:w-1/2 bg-[#0078BD] text-white font-medium py-3 rounded-lg hover:bg-[#0078BD] cursor-pointer transition flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Add Administration Fee ($30)"
          )}
        </button>
      </div>
    </div>
  );
};

export default ViolationForm;