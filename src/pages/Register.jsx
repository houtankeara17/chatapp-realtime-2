import React, { useState, useContext } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Register() {
  const { registerSuccess } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
    nickname: "",
  });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/register", form);
      const user = res.data.payload || res.data.user;
      registerSuccess(user); // This triggers toast
      nav("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded shadow">
      <h2 className="text-xl mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="username"
          className="w-full p-2 border rounded"
          required
        />
        <input
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          placeholder="nickname"
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="password"
          className="w-full p-2 border rounded"
          required
        />
        <button className="w-full bg-green-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
