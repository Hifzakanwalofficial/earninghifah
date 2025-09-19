import React, { useState } from "react";
import axios from "axios";

const Register = () => {
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
      const response = await axios.post(
        "https://expensemanager-production-4513.up.railway.app/api/admin/signup",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      // Show success alert
      alert("Signup successful! You can now log in.");

      // Clear form
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      // Show error alert
      const errorMessage =
        error.response?.data?.message || "Failed to sign up. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Secure access to your fleet anytime, anywhere
        </p>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Sign up</h3>
          <p className="text-sm text-gray-500">
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
                required
              />
            </div>

            {/* Login Link */}
            <p className="text-sm text-blue-600 hover:underline cursor-pointer mt-4">
              Already have an Account? <a href="/login">Login</a>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white p-2 rounded-md hover:bg-blue-800 transition-colors mt-4"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;