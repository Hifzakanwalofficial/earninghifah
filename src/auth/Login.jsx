import React, { useState } from "react";

const Login = () => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
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
      const response = await fetch(
        "https://expensemanager-production-4513.up.railway.app/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to log in.");
      }

      // Show success alert
      alert("Login successful!");

      // Clear form
      setFormData({ email: "", password: "" });
    } catch (error) {
      // Show error alert
      alert(error.message || "Failed to log in. Please try again.");
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
          <h3 className="text-lg font-medium text-gray-700">Sign in</h3>
          <p className="text-sm text-gray-500">Choose your preferred login method</p>

          <div>
            <button
              type="button"
              className="w-full bg-blue-700 text-white p-2 rounded-md mb-4 hover:bg-blue-800 transition-colors"
              disabled
            >
              Email
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
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

            <p className="text-sm text-blue-600 hover:underline cursor-pointer text-right mt-4">
              Forgot Password?
            </p>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white p-2 rounded-md hover:bg-blue-800 transition-colors mt-4"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;