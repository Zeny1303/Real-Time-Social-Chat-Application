import axios from "axios";

/**
 * Axios instance
 * Single source of truth for API communication
 */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Persist JWT response
 */
const saveUser = (data) => {
  if (data?.access) {
    localStorage.setItem("user", JSON.stringify(data));
  }
};

/**
 * Signup user
 */
const signup = async (email, password) => {
  const response = await api.post("/signup", {
    email,
    password,
  });

  saveUser(response.data);
  return response.data;
};

/**
 * Login user
 */
const login = async (username, password) => {
  const response = await api.post("/login/", {
    username,
    password,
  });

  saveUser(response.data);
  return response.data;
};

/**
 * Logout user
 */
const logout = () => {
  localStorage.removeItem("user");
};

/**
 * Get logged-in user from storage
 */
const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export default {
  signup,
  login,
  logout,
  getCurrentUser,
};
