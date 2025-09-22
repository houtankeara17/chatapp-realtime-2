import axios from "axios";

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const res = await axios.get("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      return res.data.payload; // UserDTO
    }
    return null;
  } catch (err) {
    console.error("Auth restore failed", err);
    return null;
  }
};
