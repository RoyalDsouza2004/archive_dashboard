import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import CryptoJS from "crypto-js";

const SECRET_KEY =import.meta.env.VITE_SECRET_KEY;

const Login = ({ onLoginSuccess, isLoggedIn, setUserName, setIsAdmin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const encryptedEmail = localStorage.getItem("temp_email");
    const encryptedPassword = localStorage.getItem("temp_password");

    if (encryptedEmail) {
      const bytesEmail = CryptoJS.AES.decrypt(encryptedEmail, SECRET_KEY);
      setEmail(bytesEmail.toString(CryptoJS.enc.Utf8));
    }

    if (encryptedPassword) {
      const bytesPassword = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
      setPassword(bytesPassword.toString(CryptoJS.enc.Utf8));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Encrypt and store email/password temporarily
    localStorage.setItem("temp_email", CryptoJS.AES.encrypt(email, SECRET_KEY).toString());
    localStorage.setItem("temp_password", CryptoJS.AES.encrypt(password, SECRET_KEY).toString());

    try {
      const res = await axios.post(
        "/user/login",
        { email, password, rememberMe },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        onLoginSuccess();
        setUserName(res.data.userName);
        setIsAdmin(res.data.isAdmin);
        navigate("/");

        // Clear stored credentials
        localStorage.removeItem("temp_email");
        localStorage.removeItem("temp_password");
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-5 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="rememberMe"
            className="mr-2 accent-purple-500"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Remember Me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
