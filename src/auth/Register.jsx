import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Baseurl } from "../Config";

const Register = () => {
  const navigate = useNavigate();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // State to manage loading
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${Baseurl}/admin/signup`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      // Show success toast
      toast.success("Signup successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 2000,
      });

      // Clear form
      setFormData({ name: "", email: "", password: "" });

      // Redirect after delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Show error toast
      const errorMessage =
        error.response?.data?.message || "Failed to sign up. Please try again.";
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-4">
      <h2 className="text-[32px] font-semibold text-center text-gray-800 mb-4">
        Register
      </h2>
      <p className="text-center text-gray-600 mb-6">Create Your Account</p>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="space-y-4">
          <h3 className="text-[24px] text-center robotosemibold text-gray-700">
            Sign up
          </h3>
          <p className="text-[16px] text-gray-500 text-center">
            Provide details to create your account
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 p-2 w-full border rounded-md bg-gray-50 focus:outline-none"
                style={{ borderColor: "#CCCCCC" }}
                required
              />
            </div>

            {/* Email Field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Email or User Name
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 p-2 w-full border rounded-md bg-gray-50 focus:outline-none"
                style={{ borderColor: "#CCCCCC" }}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-1 p-2 w-full border rounded-md bg-gray-50 focus:outline-none"
                style={{ borderColor: "#CCCCCC" }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#0078BD] text-white p-2 rounded-md hover:bg-[#0078BD] transition-colors mt-4"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>

            {/* Login Link */}
            <p className="text-sm text-center mt-4 robotomedium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0078BD] hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Register;
